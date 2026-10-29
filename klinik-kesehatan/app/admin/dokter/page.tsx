'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Kunjungan {
  id: number;
  nomor_antrean: number;
  tanggal: string;
  keluhan: string;
  status: string;
  pasien: { nama: string; jenis_kelamin: string; tanggal_lahir: string };
  layanan: { nama: string };
}

export default function DashboardDokterMinggu2() {
  const supabase = createClient();
  const [antrean, setAntrean] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk menangani form rekam medis
  const [terpilih, setTerpilih] = useState<Kunjungan | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [catatan, setCatatan] = useState('');

  // 1. DASHBOARD DOKTER: Mengambil antrean yang HANYA MILIK DOKTER yang login
  const fetchAntreanSaya = async () => {
    setLoading(true);
    // Mendapatkan user auth yang login
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    // Cari ID dokter berdasarkan auth UID pengguna
    const { data: dokterData } = await supabase
      .from('dokter')
      .select('id')
      .eq('pengguna_id', authData.user.id)
      .single();

    if (dokterData) {
      // Ambil riwayat/antrean kunjungan hari ini khusus milik id dokter tersebut
      const hariIni = new Date().toISOString().split('T')[0];
      const { data: kunjunganList } = await supabase
        .from('kunjungan')
        .select('*, pasien(nama, jenis_kelamin, tanggal_lahir), layanan(nama)')
        .eq('dokter_id', dokterData.id)
        .eq('tanggal', hariIni)
        .in('status', ['menunggu', 'dipanggil'])
        .order('nomor_antrean', { ascending: true });

      if (kunjunganList) setAntrean(kunjunganList as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAntreanSaya();
  }, []);

  // 2. PROSES PANGGIL PASIEN (Mengubah status dari menunggu menjadi dipanggil)
  const handlePanggil = async (id: number) => {
    await supabase.from('kunjungan').update({ status: 'dipanggil' }).eq('id', id);
    fetchAntreanSaya();
  };

  // 3. FORM & TINDAKAN VALIDASI 3 LAPISAN (SUBMIT REKAM MEDIS)
  const handleSubmitPeriksa = async (e: React.FormEvent) => {
    e.preventDefault();

    // === VALIDASI LAPISAN 1: Validasi Frontend (Form tidak boleh kosong) ===
    if (!diagnosis.trim()) return alert('Error Lapisan 1: Diagnosis wajib diisi oleh dokter!');
    if (!tindakan.trim()) return alert('Error Lapisan 1: Tindakan medis wajib diisi!');

    // === VALIDASI LAPISAN 2: Validasi Status Alur Kerja Aplikasi ===
    if (!terpilih || terpilih.status !== 'dipanggil') {
      return alert('Error Lapisan 2: Pasien harus dipanggil terlebih dahulu sebelum diperiksa!');
    }

    // Input data ke tabel rekam_medis
    const { error: errorRM } = await supabase
      .from('rekam_medis')
      .insert([{
        kunjungan_id: terpilih.id,
        keluhan: terpilih.keluhan,
        diagnosis: diagnosis,
        tindakan: tindakan,
        catatan: catatan
      }]);

    if (errorRM) {
      // === VALIDASI LAPISAN 3: Validasi Database (Trigger & Constraints Supabase) ===
      return alert('Error Lapisan 3 (Database): ' + errorRM.message);
    }

    // Jika simpan rekam medis sukses, ubah status antrean kunjungan menjadi 'selesai'
    const { error: errorKunjungan } = await supabase
      .from('kunjungan')
      .update({ status: 'selesai' })
      .eq('id', terpilih.id);

    if (errorKunjungan) {
      alert('Gagal update status kunjungan: ' + errorKunjungan.message);
    } else {
      alert('Pemeriksaan pasien selesai disimpan!');
      setTerpilih(null);
      setDiagnosis('');
      setTindakan('');
      setCatatan('');
      fetchAntreanSaya(); // Refresh antrean
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
      {/* BAGIAN DAFTAR ANTREAN DOKTER */}
      <div className="lg:col-span-1 bg-zinc-800 p-6 rounded-lg border border-zinc-700">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Antrean Pasien Saya</h2>
        {loading ? (
          <p className="text-zinc-400">Memuat antrean...</p>
        ) : antrean.length === 0 ? (
          <p className="text-zinc-500">Tidak ada antrean pasien untuk Anda hari ini.</p>
        ) : (
          <div className="space-y-3">
            {antrean.map((k) => (
              <div key={k.id} className={`p-4 rounded-lg border transition-all ${terpilih?.id === k.id ? 'bg-blue-950/40 border-blue-500' : 'bg-zinc-900 border-zinc-700'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-zinc-700 text-xs px-2 py-0.5 rounded-full font-bold">No. {k.nomor_antrean}</span>
                    <h3 className="font-bold text-gray-200 mt-1">{k.pasien?.nama}</h3>
                    <p className="text-xs text-zinc-400">{k.layanan?.nama}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${k.status === 'dipanggil' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-zinc-700 text-zinc-300'}`}>
                    {k.status}
                  </span>
                </div>
                
                <div className="mt-4 flex gap-2">
                  {k.status === 'menunggu' ? (
                    <button onClick={() => handlePanggil(k.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-xs py-1.5 rounded font-bold">Panggil</button>
                  ) : (
                    <button onClick={() => setTerpilih(k)} className="w-full bg-green-600 hover:bg-green-700 text-xs py-1.5 rounded font-bold">Periksa Pasien</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BAGIAN FORM PEMERIKSAAN & TINDAKAN (VALIDASI 3 LAPISAN) */}
      <div className="lg:col-span-2 bg-zinc-800 p-6 rounded-lg border border-zinc-700">
        <h2 className="text-xl font-bold mb-4 text-green-400">Form Pemeriksaan Medis</h2>
        {terpilih ? (
          <form onSubmit={handleSubmitPeriksa} className="space-y-4 text-black">
            <div className="bg-zinc-900 p-4 rounded border border-zinc-700 text-zinc-300 text-sm mb-2">
              <p><strong>Nama Pasien:</strong> {terpilih.pasien?.nama} ({terpilation.pasien?.jenis_kelamin})</p>
              <p><strong>Keluhan Utama:</strong> {terpilih.keluhan || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Diagnosis Dokter (Wajib)</label>
              <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full p-2 rounded bg-white text-black font-medium" placeholder="Misal: Faringitis Akut / Dyspepsia" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tindakan / Terapi Medis (Wajib)</label>
              <textarea value={tindakan} onChange={(e) => setTindakan(e.target.value)} rows={3} className="w-full p-2 rounded bg-white text-black font-medium" placeholder="Misal: Pemberian antibiotik dan edukasi istirahat" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Catatan Tambahan & Resep Obat</label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} className="w-full p-2 rounded bg-white text-black font-medium" placeholder="Resep obat atau instruksi kontrol kembali..." />
            </div>

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded transition-all">
              Simpan Rekam Medis & Selesaikan Kunjungan
            </button>
          </form>
        ) : (
          <div className="text-center p-12 text-zinc-500 border border-dashed border-zinc-700 rounded-lg">
            Silakan pilih pasien dengan status "dipanggil" di sebelah kiri untuk mengisi form tindakan medis.
          </div>
        )}
      </div>
    </div>
  );
}
