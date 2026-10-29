'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Dokter {
  id: number;
  nama: string;
  spesialis: string;
  no_str: string;
  aktif: boolean;
}

export default function CRUDDokter() {
  const supabase = createClient();
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

    // Sesuai trik Bypass Dummy User ID yang kita bahas sebelumnya
    // Ganti teks dummyUserId di bawah ini dengan UUID dari tabel 'pengguna' Supabase Anda
    const dummyUserId = "MASUKKAN-KODE-UUID-PENGGUNA-SUPABASE-DI-SINI"; 

    if (dummyUserId === "MASUKKAN-KODE-UUID-PENGGUNA-SUPABASE-DI-SINI") {
      return alert('Mohon ganti teks dummyUserId dengan kode UUID asli dari tabel pengguna di Supabase Anda!');
    }

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
      <h1 className="text-2xl font-bold mb-6 text-center">CRUD Master Data Dokter</h1>

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
  <select 
    value={spesialis} 
    onChange={(e) => setSpesialis(e.target.value)} 
    className="w-full border p-2 rounded bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">-- Pilih Spesialis --</option>
    <option value="Umum">Umum</option>
    <option value="Gigi">Gigi</option>
    <option value="Anak (KIA)">Anak (KIA)</option>
  </select>
</div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">No. STR</label>
            <input type="text" value={noStr} onChange={(e) => setNoStr(e.target.value)} maxLength={6} className="w-full border p-2 rounded bg-white font-medium" placeholder="Contoh: 12345" />
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
            {dokterList.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">Belum ada data dokter.</td>
              </tr>
            ) : (
              dokterList.map((item) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
