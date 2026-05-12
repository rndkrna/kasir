import { 
  ThermalPrinter, 
  PrinterTypes, 
  CharacterSet 
} from 'node-thermal-printer';
import { Order } from '@/types';
import { formatRupiah } from './utils';

export const printReceipt = async (order: Order) => {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Default type
    interface: `tcp://${process.env.PRINTER_HOST}:${process.env.PRINTER_PORT || 9100}`,
    characterSet: CharacterSet.PC437_USA,
    removeSpecialCharacters: false,
    lineCharacter: "=",
    width: 32, // Struk 58mm biasanya 32 karakter
  });

  try {
    // Mode Simulasi untuk Testing tanpa Printer Fisik
    if (process.env.PRINTER_SIMULATION === 'true') {
      console.log('--- SIMULASI CETAK STRUK ---');
      console.log(`Order ID: ${order.id}`);
      console.log(`Meja: ${order.tables?.nomor_meja}`);
      console.log(`Total: ${formatRupiah(order.total)}`);
      console.log('----------------------------');
      return;
    }

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error('Printer tidak terhubung atau IP salah. Periksa IP di file .env atau aktifkan PRINTER_SIMULATION=true');
    }

    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println("KAFÉ POS");
    printer.bold(false);
    printer.setTextNormal();
    printer.println("--------------------------------");
    
    printer.alignLeft();
    printer.println(`Meja: ${order.tables?.nomor_meja}`);
    printer.println(`Waktu: ${new Date(order.created_at).toLocaleString('id-ID')}`);
    printer.println("--------------------------------");

    order.order_items?.forEach((item) => {
      printer.println(`${item.nama_menu}`);
      const priceStr = formatRupiah(item.harga_saat_pesan * item.qty);
      printer.println(`${item.qty} x ${formatRupiah(item.harga_saat_pesan).padEnd(10)} ${priceStr.padStart(10)}`);
    });

    printer.println("--------------------------------");
    printer.alignRight();
    printer.bold(true);
    printer.println(`TOTAL: ${formatRupiah(order.total)}`);
    printer.bold(false);
    
    printer.alignCenter();
    printer.println("");
    printer.println("Terima Kasih!");
    printer.println("Silakan berkunjung kembali");
    
    printer.cut();
    await printer.execute();
  } catch (error) {
    console.error('Printer Error:', error);
    throw error;
  }
};
