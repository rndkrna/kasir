-- Seed data for tables
insert into tables (nomor_meja) values (1), (2), (3), (4), (5);

-- Seed data for menus
insert into menus (nama, deskripsi, harga, kategori, urutan) values
('Espresso', 'Kopi hitam pekat', 15000, 'kopi', 1),
('Cafe Latte', 'Kopi dengan susu creamy', 25000, 'kopi', 2),
('Matcha Latte', 'Teh hijau Jepang dengan susu', 28000, 'non-kopi', 3),
('Lemon Tea', 'Teh segar dengan irisan lemon', 18000, 'non-kopi', 4),
('Nasi Goreng Spesial', 'Nasi goreng dengan telur dan ayam', 35000, 'makanan', 5),
('Kentang Goreng', 'Camilan kentang renyah', 20000, 'makanan', 6);
