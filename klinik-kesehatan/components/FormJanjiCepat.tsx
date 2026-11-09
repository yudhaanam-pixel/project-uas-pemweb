"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { JAM, POLI, hariIniWIB } from "@/lib/validasi";

export default function FormJanjiCepat() {
  const router = useRouter();
  const [poli, setPoli] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");

  function lanjut(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (poli) q.set("poli", poli);
    if (tanggal) q.set("tanggal", tanggal);
    if (jam) q.set("jam", jam);
    const s = q.toString();
    router.push(s ? `/kunjungan/baru?${s}` : "/kunjungan/baru");
  }

  const cls = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800";
  return (
    <form onSubmit={lanjut} className="grid gap-3 rounded-2xl bg-white p-5 shadow-xl sm:grid-cols-2">
      <label className="text-xs font-semibold text-slate-600">Poli
        <select value={poli} onChange={(e) => setPoli(e.target.value)} className={cls + " mt-1"}>
          <option value="">Pilih poli</option>
          {POLI.map((p) => <option key={p}>{p}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-600">Tanggal
        <input type="date" min={hariIniWIB()} value={tanggal} onChange={(e) => setTanggal(e.target.value)} className={cls + " mt-1"} />
      </label>
      <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Jam
        <select value={jam} onChange={(e) => setJam(e.target.value)} className={cls + " mt-1"}>
          <option value="">Pilih jam</option>
          {JAM.map((j) => <option key={j}>{j}</option>)}
        </select>
      </label>
      <button type="submit" className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:col-span-2">
        📅 Lanjut Buat Janji
      </button>
    </form>
  );
}