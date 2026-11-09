'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Kunjungan {
  id: number;
  nomor_antrean: number;
  tanggal: string;
  keluhan: string;
  status: 'dipanggil' | 'diperiksa' | 'selesai';
  pasien: {
    id: number;
    nama: string;
  };
  layanan: {
    nama: string;
  };
}

export default function DashboardDokter() {
  // State Utama
  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([]);
  const [pasienAktif, setPasienAktif] = useState<Kunjungan | null>(null);
  const [loading, setLoading] = useState(true);

  // State Form Rekam Medis
  const [diagnosis, setDiagnosis] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [catatan, setCatatan] = useState('');

  // ID Dokter Dummy (Gunakan ID Dokter hasil input dari CRUD sebelumnya)
  const DUMMY_DOKTER_ID = 1; 

  // 1. Ambil data pasien dengan status 'dipanggil' atau 'diperiksa'
  const fetchAntrean = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('kunjungan')
      .select(`
        id, nomor_antrean, tanggal, keluhan, status,
        pasien (id, nama),
        layanan (nama)
      `)
      .eq('dokter_id', DUMMY_DOKTER_ID)
      .eq('tanggal', today)
      .in('status', ['dipanggil', 'diperiksa'])
      .order('nomor_antrean', { ascending: true });

    if (error) {
      console.error('Error fetching antrean:', error.message);
    } else if (data) {
      const list = data as unknown as Kunjungan[];
      setKunjunganList(list);
      
      // Jika ada pasien yang statusnya sedang 'diperiksa', otomatis kunci di layar utama
      const sedangDiperiksa = list.find(k => k.status === 'diperiksa');
      if (sedangDiperiksa) setPasienAktif(sedangDiperiksa);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAntrean();
  }, [fetchAntrean]);

  // 2. Alur Transisi Ala: Mengubah status dari 'dipanggil' menjadi 'diperiksa'
  const handleMulaiPeriksa = async (kunjungan: Kunjungan) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('kunjungan')
      .update({ status: 'diperiksa' })
      .eq('id', kunjungan.id);

    if (error) {
      alert('Gagal memperbarui status: ' + error.message);
    } else {
      setPasienAktif({ ...kunjungan, status: 'diperiksa' });
      fetchAntrean();
    }
  };

  // 3. Alur Selesai: Insert Rekam Medis dulu baru update status kunjungan menjadi 'selesai'
  const handleSelesaiPeriksa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasienAktif) return;
    if (!diagnosis) return alert('Diagnosis wajib diisi!');

    const supabase = createClient();

    // Langkah A: Simpan rekam medis ke database
    const { error: rmError } = await supabase
      .from('rekam_medis')
      .insert([{
        kunjungan_id: pasienAktif.id,
        keluhan: pasienAktif.keluhan,
        diagnosis,
        tindakan,
        catatan
      }]);

    if (rmError) {
      return alert('Gagal menyimpan rekam medis: ' + rmError.message);
    }

    // Langkah B: Update status kunjungan menjadi 'selesai' (Lolos dari trigger check)
    const { error: kunjunganError } = await supabase
      .from('kunjungan')
      .update({ status: 'selesai' })
      .eq('id', pasienAktif.id);

    if (kunjunganError) {
      alert('Gagal menyelesaikan kunjungan: ' + kunjunganError.message);
    } else {
      alert('Pemeriksaan berhasil diselesaikan!');
      // Reset form & state pasien
      setPasienAktif(null);
      setDiagnosis('');
      setTindakan('');
      setCatatan('');
      fetchAntrean();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 text-white grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* PANEL KIRI: DAFTAR ANTREAN */}
      <div className="md:col-span-1 bg-gray-900 border border-gray-800 p-4 rounded-lg h-fit">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-400">Antrean Hari Ini</h2>
          <button onClick={fetchAntrean} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700">Refresh</button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Memuat data...</p>
        ) : kunjunganList.length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada antrean yang perlu dipanggil/diperiksa.</p>
        ) : (
          <div className="space-y-3">
            {kunjunganList.map((item) => (
              <div key={item.id} className={`p-3 rounded-lg border text-sm transition-all ${pasienAktif?.id === item.id ? 'bg-green-950/40 border-green-600' : 'bg-gray-800 border-gray-700'}`}>
                <div className="flex justify-between font-semibold mb-1">
                  <span>No. {item.nomor_antrean} - {item.pasien?.nama}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${item.status === 'diperiksa' ? 'bg-orange-900/60 text-orange-400' : 'bg-blue-900/60 text-blue-400'}`}>{item.status}</span>
                </div>
                <p className="text-gray-400 text-xs mb-2">Layanan: {item.layanan?.nama}</p>
                {item.status === 'dipanggil' && !pasienAktif && (
                  <button onClick={() => handleMulaiPeriksa(item)} className="w-full bg-green-600 hover:bg-green-700 py-1 rounded text-xs font-bold transition-all">Mulai Periksa</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL KANAN: FORM PEMERIKSAAN UTAMA */}
      <div className="md:col-span-2 bg-gray-900 border border-gray-800 p-6 rounded-lg">
        {pasienAktif ? (
          <div>
            <div className="border-b border-gray-800 pb-4 mb-4">
              <h1 className="text-xl font-bold text-gray-200">Pemeriksaan Aktif</h1>
              <p className="text-sm text-gray-400 mt-1">Pasien: <span className="text-green-400 font-semibold">{pasienAktif.pasien?.nama}</span> | No. Antrean: {pasienAktif.nomor_antrean}</p>
              <div className="bg-gray-800 p-3 rounded mt-2 border border-gray-700 text-sm">
                <span className="font-semibold block text-xs text-gray-400 mb-1">Keluhan Awal Pasien:</span>
                "{pasienAktif.keluhan || 'Tidak ada keluhan tertulis.'}"
              </div>
            </div>

            {/* FORM INPUT REKAM MEDIS */}
            <form onSubmit={handleSelesaiPeriksa} className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Diagnosis <span className="text-red-400">*</span></label>
                <textarea rows={2} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full p-2.5 rounded bg-white font-medium border focus:ring-2 focus:ring-green-500 outline-none" placeholder="Masukkan diagnosis hasil pemeriksaan..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Tindakan Medis (Opsional)</label>
                <textarea rows={2} value={tindakan} onChange={(e) => setTindakan(e.target.value)} className="w-full p-2.5 rounded bg-white font-medium border focus:ring-2 focus:ring-green-500 outline-none" placeholder="Contoh: Pemberian parasetamol 500mg, pembersihan karang gigi..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Catatan Tambahan / Resep (Opsional)</label>
                <textarea rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full p-2.5 rounded bg-white font-medium border focus:ring-2 focus:ring-green-500 outline-none" placeholder="Contoh: Kontrol kembali jika demam tidak turun dalam 3 hari." />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded transition-all">Simpan Rekam Medis & Selesaikan Kunjungan</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-64 flex flex-col justify-center items-center text-gray-500">
            <svg className="w-12 h-12 mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <p className="text-sm font-medium">Silakan pilih pasien dan klik "Mulai Periksa" pada panel antrean.</p>
          </div>
        )}
      </div>

    </div>
  );
}
