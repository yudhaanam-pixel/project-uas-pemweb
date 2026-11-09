"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  JAM, POLI, validasiKunjungan, hariIniWIB,
  type ErrorKunjungan, type InputKunjungan,
} from "@/lib/validasi";

type Status = "idle" | "loading" | "error";

export default function FormKunjungan() {
  const router = useRouter();
  const [form, setForm] = useState<InputKunjungan>({ poli: "", tanggal: "", jam: "", keluhan: "" });
  const [errors, setErrors] = useState<ErrorKunjungan>({});
  const [status, setStatus] = useState<Status>("idle");
  const [pesan, setPesan] = useState("");

  const ubah = (k: keyof InputKunjungan) => (e: React.ChangeEvent<any>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    const lokal = validasiKunjungan(form);
    if (Object.keys(lokal).length) { setErrors(lokal); return; }

    setStatus("loading"); setPesan("");
    try {
      const res = await fetch("/api/kunjungan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? {});
        setPesan(json.error ?? "Terjadi kesalahan");
        setStatus("error");
        return;
      }
      router.push("/dashboard/riwayat?baru=1");
      router.refresh();
    } catch {
      setPesan("Tidak dapat terhubung ke server");
      setStatus("error");
    }
  }

  const cls = "w-full rounded border px-3 py-2 text-black";
  const Err = ({ k }: { k: keyof InputKunjungan }) =>
    errors[k] ? <p role="alert" className="mt-1 text-sm text-red-500">{errors[k]}</p> : null;

  return (
    <form onSubmit={kirim} noValidate className="space-y-4">
      {pesan && <p role="alert" className="rounded bg-red-100 p-3 text-red-700">{pesan}</p>}

      <div>
        <label htmlFor="poli">Poli</label>
        <select id="poli" value={form.poli} onChange={ubah("poli")} className={cls}>
          <option value="">-- Pilih poli --</option>
          {POLI.map((p) => <option key={p}>{p}</option>)}
        </select>
        <Err k="poli" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tanggal">Tanggal</label>
          <input id="tanggal" type="date" min={hariIniWIB()} value={form.tanggal}
                 onChange={ubah("tanggal")} className={cls} />
          <Err k="tanggal" />
        </div>
        <div>
          <label htmlFor="jam">Jam</label>
          <select id="jam" value={form.jam} onChange={ubah("jam")} className={cls}>
            <option value="">-- Jam --</option>
            {JAM.map((j) => <option key={j}>{j}</option>)}
          </select>
          <Err k="jam" />
        </div>
      </div>

      <div>
        <label htmlFor="keluhan">Keluhan</label>
        <textarea id="keluhan" rows={4} maxLength={500} value={form.keluhan}
                  onChange={ubah("keluhan")} className={cls} />
        <div className="flex justify-between">
          <Err k="keluhan" />
          <span className="ml-auto text-sm opacity-70">{form.keluhan.length}/500</span>
        </div>
      </div>

      <button type="submit" disabled={status === "loading"}
              className="rounded bg-teal-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
        {status === "loading" ? "Menyimpan..." : "Daftar Kunjungan"}
      </button>
    </form>
  );
}