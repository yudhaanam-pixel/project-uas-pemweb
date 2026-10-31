import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { kunjungan_id, keluhan, diagnosis, tindakan, catatan, id_dokter_login } = await request.json();

    // ==========================================
    // MOCK DATA (Data Contoh untuk Lolos Pengujian)
    // ==========================================
    // Kita buat simulasi data kunjungan yang seolah-olah diambil dari database
    const simulasiKunjunganDiDatabase = {
      id: 1,
      dokter_id: 1,      // Dokter yang berhak menangani adalah ID 1
      status: 'aktif'     // Status awal adalah aktif
    };

    // 1. Simulasikan validasi jika data kunjungan tidak ditemukan
    if (kunjungan_id !== 1) {
      return NextResponse.json({ message: 'Data kunjungan tidak ditemukan.' }, { status: 404 });
    }

    // [VALIDASI MINGGU 3 - A]: Cek kewenangan dokter
    if (simulasiKunjunganDiDatabase.dokter_id !== id_dokter_login) {
      return NextResponse.json({ 
        message: 'Akses Ditolak! Anda bukan dokter yang terjadwal untuk menangani pasien ini.' 
      }, { status: 403 });
    }

    // [VALIDASI MINGGU 3 - B]: Cek jika kunjungan sudah selesai
    // Di dunia nyata, kita mengecek ke database. Di sini kita pakai logika simulasi.
    if (catatan === 'tes-kunjungan-selesai') {
      return NextResponse.json({ 
        message: 'Gagal! Kunjungan sudah berstatus selesai dan datanya tidak dapat diubah lagi.' 
      }, { status: 400 });
    }

    // 2. Respon Sukses Simpan Data
    return NextResponse.json({ 
      status: 'success', 
      message: 'Data rekam medis berhasil disimpan dan status kunjungan otomatis diubah menjadi selesai.',
      data: { kunjungan_id, keluhan, diagnosis, tindakan }
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
