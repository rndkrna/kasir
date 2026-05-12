export type UserRole = 'kasir' | 'admin';

export interface Table {
  id: string;
  nomor_meja: number;
  qr_code_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  nama: string;
  deskripsi?: string;
  harga: number;
  kategori: 'kopi' | 'non-kopi' | 'makanan' | 'lainnya';
  foto_url?: string;
  is_available: boolean;
  urutan: number;
  created_at: string;
}

export interface Order {
  id: string;
  table_id: string;
  status: 'baru' | 'diproses' | 'selesai' | 'dibatalkan';
  payment_status: 'belum_bayar' | 'sudah_bayar';
  total: number;
  catatan?: string;
  created_at: string;
  updated_at: string;
  kasir_name?: string;
  // Optional relations
  tables?: Table;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  nama_menu: string;
  harga_saat_pesan: number;
  qty: number;
  created_at: string;
  // Optional relations
  menus?: MenuItem;
}
