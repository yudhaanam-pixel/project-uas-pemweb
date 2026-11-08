
"use client";

import { useEffect, useState, FormEvent } from "react";

type Dokter = {
  id: number;
  nama: string;
  spesialis: string;
};

type Layanan = {
  id: number;
  nama: string;
  deskripsi: string;
};

export default function PendaftaranKunjungan() {
  const [dokter, setDokter] = useState<Dokter[]>([]);
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    dokter_id: "",
    layanan_id: "",
    tanggal: "",
    keluhan: "",
  });

  useEffect(() => {
    async function ambilData() {
      try {
        const res = await fetch("/api/pasien/kunjungan");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        setDokter(data.dokter ?? []);
        setLayanan(data.layanan ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data"
        );
      }
    }

    ambilData();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPesan("");

    if (
      !form.dokter_id ||
      !form.layanan_id ||
      !form.tanggal
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    if (
      new Date(form.tanggal + "T00:00:00") <
      new Date(new Date().toDateString())
    ) {
      setError("Tanggal kunjungan tidak boleh di masa lalu.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pasien/kunjungan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          dokter_id: Number(form.dokter_id),
          layanan_id: Number(form.layanan_id),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pendaftaran gagal");
      }

      setPesan(
        `Pendaftaran berhasil! Nomor antrean: ${data.nomor_antrean}`
      );

      setForm({
        dokter_id: "",
        layanan_id: "",
        tanggal: "",
        keluhan: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-8">
          <p className="font-semibold text-sky-600">
            WELLCARE MEDICAL CLINIC
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-800">
            Pendaftaran Kunjungan
          </h1>

          <p className="mt-2 text-slate-500">
            Silakan isi formulir berikut untuk
            melakukan pendaftaran kunjungan klinik.
          </p>
        </div>

        {pesan && (
          <div className="mb-5 rounded-lg bg-green-100 p-4 text-green-700">
            {pesan}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Pilih Dokter
            </label>

            <select
              value={form.dokter_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  dokter_id: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-800"
              required
            >
              <option value="">Pilih Dokter</option>

              {dokter.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama} - {d.spesialis}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Pilih Layanan
            </label>

            <select
              value={form.layanan_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  layanan_id: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-800"
              required
            >
              <option value="">Pilih Layanan</option>

              {layanan.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Tanggal Kunjungan
            </label>

            <input
              type="date"
              min={new Date().toLocaleDateString("en-CA")}
              value={form.tanggal}
              onChange={(e) =>
                setForm({
                  ...form,
                  tanggal: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Keluhan Pasien
            </label>

            <textarea
              rows={4}
              placeholder="Tuliskan keluhan kesehatan Anda..."
              value={form.keluhan}
              onChange={(e) =>
                setForm({
                  ...form,
                  keluhan: e.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Memproses Pendaftaran..."
              : "Daftar Kunjungan"}
          </button>

        </form>
      </div>
    </main>
  );
}
