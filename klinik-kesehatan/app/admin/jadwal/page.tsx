'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Jadwal {
  id: number;
  dokter_id: number;
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
  kuota: number;
  aktif: boolean;
  dokter: { nama: string; spesialis: string } | null;
}

interface Dokter {
  id: number;
  nama: string;
}

const NAMA_HARI = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function CRUDJadwal() {
  const supabase = createClient();
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  
  const [dokterId, setDokterId] = useState('');
  const [hari, setHari] = useState('1');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('14:00');
  const [kuota, setKuota] = useState('20');

  const fetchData = async () => {
    const { data: jadwal } = await supabase
      .from('jadwal_praktik')
      .select('*, dokter(nama, spesialis)')
      .order('hari', { ascending: true });
    
    const { data: dokter } = await supabase
      .from('dokter')
      .select('id, nama')
      .eq('aktif', true);

    if (jadwal) setJadwalList(jadwal as any);
    if (dokter) setDokterList(dokter);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. TAMBAH JADWAL (CREATE)
  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dokterId) return alert('Silakan pilih dokter terlebih dahulu!');

    const { error } = await supabase
      .from('jadwal_praktik')
      .insert([{
        dokter_id: parseInt(dokterId),
        hari: parseInt(hari),
        jam_mulai: jamMulai + ':00',
        jam_selesai: jamSelesai + ':00',
        kuota: parseInt(kuota),
        aktif: true
      }]);

    if (error) {
      alert('Gagal menambah jadwal: ' + error.message);
    } else {
      alert('Jadwal berhasil ditambahkan!');
      fetchData();
    }
  };

  // 2. UBAH STATUS / NONAKTIFKAN JADWAL (UPDATE) -> BARU DITAMBAHKAN
  const handleToggleAktif = async (id: number, statusSekarang: boolean) => {
    const { error } = await supabase
      .from('jadwal_praktik')
      .update({ aktif: !statusSekarang })
      .eq('id', id);

    if (error) alert('Gagal mengubah status jadwal: ' + error.message);
    else fetchData();
  };

  return (
    <div className="max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Kelola Jadwal Praktik Dokter</h1>

      {/* FORM INPUT */}
      <form onSubmit={handleTambah} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-green-400">Atur Alokasi Jadwal Baru</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 text-black">
          <div>
            <label className="block text-sm mb-1 text-gray-300">Pilih Dokter</label>
            <select value={dokterId} onChange={(e) => setDokterId(e.target.value)} className="w-full border p-2 rounded bg-white font-medium">
              <option value="">-- Pilih --</option>
              {dokterList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Hari</label>
            <select value={hari} onChange={(e) => setHari(e.target.value)} className="w-full border p-2 rounded bg-white font-medium">
              {[1, 2, 3, 4, 5, 6, 7].map(h => (
                <option key={h} value={h}>{NAMA_HARI[h]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Jam Mulai</label>
            <input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} className="w-full border p-2 rounded bg-white font-medium" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Jam Selesai</label>
            <input type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} className="w-full border p-2 rounded bg-white font-medium" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Kuota Pasien</label>
            <input type="number" value={kuota} onChange={(e) => setKuota(e.target.value)} className="w-full border p-2 rounded bg-white font-medium" />
          </div>
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-bold transition-all">Simpan Jadwal</button>
      </form>

      {/* TABEL DATA */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700 text-gray-300">
              <th className="p-3">Dokter</th>
              <th className="p-3">Hari</th>
              <th className="p-3 text-center">Jam Operasional</th>
              <th className="p-3 text-center">Kuota</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {jadwalList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">Belum ada data jadwal praktik.</td>
              </tr>
            ) : (
              jadwalList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/50">
                  <td className="p-3 font-semibold text-gray-200">
                    {item.dokter?.nama || 'Dokter tidak ditemukan'} 
                    <span className="text-xs text-gray-400 block">{item.dokter?.spesialis}</span>
                  </td>
                  <td className="p-3 text-gray-300">{NAMA_HARI[item.hari]}</td>
                  <td className="p-3 text-center text-gray-400">
                    {item.jam_mulai?.substring(0, 5)} - {item.jam_selesai?.substring(0, 5)} WIB
                  </td>
                  <td className="p-3 text-center text-green-400 font-bold">{item.kuota} Pasien</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.aktif ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                      {item.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleToggleAktif(item.id, item.aktif)} className={`text-sm font-bold hover:underline ${item.aktif ? 'text-red-400' : 'text-blue-400'}`}>
                      {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
