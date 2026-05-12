import { useMemo } from 'react';
import { Order } from '@/types';

export const useLaporan = (
  orders: Order[], 
  viewMode: 'harian' | 'mingguan' | 'bulanan',
  dateFrom: string,
  dateTo: string
) => {
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    const hours = orders.map(o => new Date(o.created_at).getHours());
    const hourCounts = hours.reduce((acc: Record<number, number>, h) => {
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    }, {});
    
    let peakHour = -1;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    return {
      totalFinished: orders.length,
      totalRevenue,
      avgOrderValue,
      peakHour: peakHour === -1 ? '-' : `${peakHour}:00 - ${peakHour + 1}:00`
    };
  }, [orders]);

  const chartData = useMemo(() => {
    if (viewMode === 'bulanan') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const data = months.map(m => ({ label: m, total: 0 }));
      orders.forEach(order => {
        const monthIdx = new Date(order.created_at).getMonth();
        data[monthIdx].total += order.total;
      });
      return data;
    }

    if (viewMode === 'mingguan') {
      const weeks: { [key: string]: number } = {};
      for (let i = 3; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - (i * 7));
        const weekKey = `Minggu ${4-i}`;
        weeks[weekKey] = 0;
      }
      
      orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const diffTime = Math.abs(new Date().getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekIdx = Math.floor(diffDays / 7);
        if (weekIdx >= 0 && weekIdx < 4) {
          const key = `Minggu ${4-weekIdx}`;
          weeks[key] += order.total;
        }
      });
      return Object.entries(weeks).map(([label, total]) => ({ label, total }));
    }

    // Default: Harian
    const isSingleDay = dateFrom === dateTo;
    
    if (isSingleDay) {
      const hours: { [key: string]: number } = {};
      for (let i = 0; i < 24; i++) {
        const hourKey = `${i.toString().padStart(2, '0')}:00`;
        hours[hourKey] = 0;
      }
      
      orders.forEach(order => {
        const h = new Date(order.created_at).getHours();
        const hourKey = `${h.toString().padStart(2, '0')}:00`;
        if (hours[hourKey] !== undefined) hours[hourKey] += order.total;
      });
      
      return Object.entries(hours).map(([label, total]) => ({ label, total }));
    }

    const days: { [key: string]: number } = {};
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days[d.toISOString().split('T')[0]] = 0;
    }
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (days[date] !== undefined) days[date] += order.total;
    });
    return Object.entries(days).map(([date, total]) => ({
      label: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      total
    }));
  }, [orders, viewMode, dateFrom, dateTo]);

  const maxRevenue = useMemo(() => Math.max(...chartData.map(d => d.total), 1), [chartData]);

  const topSellingItems = useMemo(() => {
    const items: Record<string, { nama: string; qty: number; revenue: number }> = {};
    
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        if (!items[item.menu_id]) {
          items[item.menu_id] = { nama: item.nama_menu, qty: 0, revenue: 0 };
        }
        items[item.menu_id].qty += item.qty;
        items[item.menu_id].revenue += item.harga_saat_pesan * item.qty;
      });
    });

    return Object.values(items).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [orders]);

  const exportToCSV = (from: string, to: string) => {
    const headers = ['No', 'ID Pesanan', 'Waktu', 'Meja', 'Kasir', 'Item Dipesan', 'Total Harga', 'Status Pembayaran'];
    let grandTotal = 0;

    const rows = orders.map((o, idx) => {
      grandTotal += o.total;
      return [
        idx + 1,
        o.id.slice(-6).toUpperCase(),
        new Date(o.created_at).toLocaleString('id-ID').replace(',', ''),
        o.tables?.nomor_meja || 'Kasir',
        o.kasir_name || '-',
        o.order_items?.map(i => `${i.qty}x ${i.nama_menu}`).join(' | '),
        o.total,
        o.payment_status === 'sudah_bayar' ? 'LUNAS' : 'BELUM BAYAR'
      ];
    });

    const totalRow = ['', '', '', '', '', 'TOTAL PENDAPATAN', grandTotal, ''];
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';')), totalRow.join(';')].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_kafe_${from}_to_${to}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { metrics, chartData, maxRevenue, topSellingItems, exportToCSV };
};
