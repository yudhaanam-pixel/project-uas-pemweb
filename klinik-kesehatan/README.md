# 🏥 Dokumentasi Sistem Klinik Kesehatan

Repository ini berisi kode program untuk proyek klinik kesehatan, berfokus pada implementasi modul **Dokter & Admin** (Minggu 1 - Minggu 3).

## 🛠️ Fitur & Validasi yang Selesai Diuji
1. **Rekap Kunjungan Admin (Minggu 2):** Menyediakan rute API khusus di `/app/admin/rekap/route.ts` untuk menghitung total kunjungan harian dan per dokter.
2. **Validasi Hak Akses Dokter (Minggu 3):** Sistem menolak pengisian rekam medis jika dokter yang login tidak terjadwal menangani pasien tersebut (Status HTTP 403).
3. **Penguncian Data Selesai (Minggu 3):** Kunjungan yang sudah diset 'selesai' dikunci otomatis agar data rekam medis tidak dapat dimanipulasi kembali (Status HTTP 400).
4. **Pengujian Migration Database (Minggu 3):** Skema database terbukti dapat di-drop dan di-generate ulang dari nol menggunakan script SQL gabungan secara bersih di Supabase.

---

## 🚀 Petunjuk Instalasi & Menjalankan Aplikasi

### 1. Clone & Install Dependensi
```bash
# Pindah ke direktori proyek
cd klinik-kesehatan

# Install semua package pendukung
npm install
```

### 2. Konfigurasi Environment (`.env.local`)
Buat file `.env.local` di folder `klinik-kesehatan` dan sesuaikan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=isi_url_supabase_anda
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key_supabase_anda
```

### 3. Menjalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000/login](http://localhost:3000/login) pada browser Anda.

---

## 🗄️ Inisialisasi & Reset Database (Migration)
Jika ingin melakukan pengujian struktur database dari awal, gunakan berkas SQL resmi yang terletak di:
📁 `db/supabase/migrations/20261101000000_init_schema.sql`

**Langkah Reset Database Cloud via Supabase:**
1. Masuk ke dashboard **Supabase** di browser Anda, lalu pilih **SQL Editor**.
2. Salin seluruh isi dari file `20261101000000_init_schema.sql`.
3. Tempel di SQL Editor dan klik **Run**. Database Anda akan otomatis dibersihkan dan diisi data dummy kunjungan ID 1 yang valid.

---

## 📐 Dokumentasi Arsitektur Sistem
Seluruh diagram arsitektur yang valid dapat diakses pada folder berikut:
* **Diagram ERD Database Klinik:** `docs/erd-klinik.png`
* **Flowchart Sistem Admin & Dokter:** `db/migrations/diagram admin-Page-5.drawio.png`
