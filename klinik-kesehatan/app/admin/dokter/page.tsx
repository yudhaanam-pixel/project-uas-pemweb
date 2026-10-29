'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; // Menggunakan createClient sesuai modul proyek Anda

export interface Dokter {
  id: number;
  nama: string;
  spesialis: string;
  no_str: string;
  aktif: boolean;
}

export default function CRUDDokter() {
  const supabase = createClient(); // Inisialisasi client Supabase di sini
  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  const [nama, setNama] = useState('');
  const [spesialis, setSpesialis] = useState('');
  const [noStr, setNoStr] = useState('');

  const fetchDokter = async () => {
    const { data, error } = await supabase
      .from('dokter')
      .select('*')
      .order('id', { ascending: true });
    if (data) setDokterList(data);
  };

  useEffect(() => {
    fetchDokter();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !spesialis) return alert('Nama dan Spesialis wajib diisi!');

    // Mengambil user ID yang sedang aktif untuk memenuhi syarat kolom pengguna_id
   const dummyUserId = "MASUKKAN-KODE-UUID-PENGGUNA-SUPABASE-DI-SINI";


    const { error } = await supabase
      .from('dokter')
      .insert([{ 
        nama, 
        spesialis, 
        no_str: noStr, 
        pengguna_id: dummyUserId,
        aktif: true 
      }]);

    if (error) {
      alert('Gagal menambah data: ' + error.message);
    } else {
      setNama('');
      setSpesialis('');
      setNoStr('');
      fetchDokter();
    }
  };

  const handleToggleAktif = async (id: number, statusSekarang: boolean) => {
    const { error } = await supabase
      .from('dokter')
      .update({ aktif: !statusSekarang })
      .eq('id', id);

    if (error) alert('Gagal mengubah status: ' + error.message);
    else fetchDokter();
  };

  return (
    <div className="max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-6">Kelola Master Data Dokter</h1>

      {/* FORM INPUT */}
      <form onSubmit={handleTambah} className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-green-400">Tambah Dokter Baru</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-black">
          <div>
            <label className="block text-sm mb-1 text-gray-300">Nama Dokter</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full border p-2 rounded bg-white font-medium" placeholder="dr. Budi Santoso" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Spesialis</label>
            <input type="text" value={spesialis} onChange={(e) => setSpesialis(e.target.value)} className="w-full border p-2 rounded bg-white font-medium" placeholder="Umum / Gigi / Anak" />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">No. STR</label>
            <input type="text" value={noStr} onChange={(e) => setNoStr(e.target.value)} className="w-full border p-2 rounded bg-white font-medium" placeholder="16 digit nomor STR" />
          </div>
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-bold transition-all">Simpan Dokter</button>
      </form>

      {/* TABEL DATA */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700 text-gray-300">
              <th className="p-3">Nama Dokter</th>
              <th className="p-3">Spesialis</th>
              <th className="p-3">No. STR</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {dokterList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-800/50">
                <td className="p-3 font-semibold text-gray-200">{item.nama}</td>
                <td className="p-3 text-gray-400">{item.spesialis}</td>
                <td className="p-3 text-gray-400">{item.no_str || '-'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.aktif ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>{item.aktif ? 'Aktif' : 'Nonaktif'}</span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => handleToggleAktif(item.id, item.aktif)} className={`text-sm font-bold hover:underline ${item.aktif ? 'text-red-400' : 'text-blue-400'}`}>{item.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
