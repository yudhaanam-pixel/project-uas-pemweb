import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client'; // Mengubah import menjadi createClient

export async function GET() {
  try {
    // Inisialisasi instance supabase
    const supabase = createClient();

    // 1. Ambil semua data kunjungan beserta relasi nama dokternya
    const { data: semuaKunjungan, error } = await supabase
      .from('kunjungan')
      .select(`
        tanggal,
        dokter_id,
        dokter ( nama )
      `);

    if (error) throw error;

    if (!semuaKunjungan || semuaKunjungan.length === 0) {
      return NextResponse.json({ 
        status: 'success', 
        data: { per_hari: [], per_dokter: [] } 
      });
    }

    // 2. Hitung Rekap per Hari
    const hitungHari = semuaKunjungan.reduce((acc: any, curr: any) => {
      acc[curr.tanggal] = (acc[curr.tanggal] || 0) + 1;
      return acc;
    }, {});
    const rekapPerHari = Object.entries(hitungHari).map(([tanggal, total]) => ({
      tanggal,
      total_kunjungan: total
    }));

    // 3. Hitung Rekap per Dokter
    const hitungDokter = semuaKunjungan.reduce((acc: any, curr: any) => {
      const namaDokter = curr.dokter?.nama || 'Dokter Tidak Terdaftar';
      acc[namaDokter] = (acc[namaDokter] || 0) + 1;
      return acc;
    }, {});
    const rekapPerDokter = Object.entries(hitungDokter).map(([nama_dokter, total]) => ({
      nama_dokter,
      total_pasien: total
    }));

    return NextResponse.json({
      status: 'success',
      data: { per_hari: rekapPerHari, per_dokter: rekapPerDokter }
    });

  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
