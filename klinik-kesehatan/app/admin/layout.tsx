'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Jadwal {
  id: number;
  dokter_id: number;
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
  kuota: number;
  aktif: boolean;
  dokter: { nama: string; spesialis: string };
}

interface Dokter {
  id: number;
  nama: string;
}

const NAMA_HARI = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function CRUDJadwal() {
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([]);
  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  
  const [dokterId, setDokterId] = useState('');
  const [hari, setHari] = useState('1');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('14:00');
  const [kuota, setKuota] = useState('20');

  const fetchData = async () => {
    // Ambil data jadwal dengan join nama dokter
    const { data: jadwal, error: e1 } = await supabase
      .from('jadwal_praktik')
      .select('*, dokter(nama, spesialis)')
      .order('hari', { ascending: true });
    
    // Ambil list dokter aktif untuk pilihan dropdown select
    const { data: dokter, error: e2 } = await supabase
      .from('dokter')
      .select('id, nama')
      .eq('aktif', true);

    if (jadwal) setJadwalList(jadwal as any);
    if (dokter) setDokterList(dokter);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dokterId) return alert('Silakan pilih dokter terlebih dahulu!');

    const { error } = await supabase
      .from('jadwal_praktik')
      .insert([{
        dokter_id: parseInt(dokterId),
        hari: parseInt(hari),
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
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

  return (
    <div className="max-w-4xl mx-auto">
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
              {[1,2,3,4,5,6,7].map(h => <option key={h} value={h}>{NAMA_HARI[h]}</option>)}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {jadwalList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-800/50">
                <td className="p-3 font-semibold text-gray-200">
                  {item.dokter?.nama} <span className="text-xs text-gray-400 block">{item.dokter?.spesialis}</span>
                </td>
                <td className="p-3 text-gray-300">{NAMA_HARI[item.hari]}</td>
                <td className="p-3 text-center text-gray-400">{item.jam_mulai.substring(0,5)} - {item.jam_selesai.substring(0,5)} WIB</td>
                <td className="p-3 text-center text-green-400 font-bold">{item.kuota} Pasien</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
