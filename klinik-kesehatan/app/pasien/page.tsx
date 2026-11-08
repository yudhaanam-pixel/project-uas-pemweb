
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PushNotificationButton from "@/components/PushNotificationButton";


type Kunjungan = {
  id: number;
  tanggal: string;
  nomor_antrean: number;
  status: string;
  keluhan: string | null;
  dokter: {
    nama: string;
    spesialis: string;
  } | null;
  layanan: {
    nama: string;
  } | null;
};

export default function DashboardPasien() {
  const [data, setData] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function ambilRiwayat() {
      try {
        const res = await fetch("/api/pasien/dashboard");
        const result = await res.json();

        if (!res.ok) throw new Error(result.error);

        setData(result.kunjungan ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil riwayat."
        );
      } finally {
        setLoading(false);
      }
    }

    ambilRiwayat();
  }, []);

  function warnaStatus(status: string) {
    switch (status) {
      case "menunggu":
        return "bg-yellow-100 text-yellow-700";
      case "dipanggil":
        return "bg-blue-100 text-blue-700";
      case "selesai":
        return "bg-green-100 text-green-700";
      case "batal":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <section className="rounded-2xl bg-gradient-to-right from-blue-700 to-sky-400 p-8 text-white shadow-lg">
          <p className="text-sm font-medium">
            WELLCARE MEDICAL CLINIC
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Dashboard Pasien
          </h1>

          <p className="mt-2 text-blue-50">
            Pantau jadwal dan riwayat kunjungan kesehatan Anda.
          </p>

          <Link
            href="/pasien/kunjungan"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            + Daftar Kunjungan
          </Link>
                    <div className="mt-5">
            <PushNotificationButton />
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-800">
            Riwayat Kunjungan
          </h2>

          {loading && (
            <p className="text-slate-500">
              Memuat data kunjungan...
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="rounded-xl bg-sky-50 p-8 text-center">
              <p className="font-medium text-slate-700">
                Belum ada riwayat kunjungan.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Silakan lakukan pendaftaran kunjungan terlebih dahulu.
              </p>
            </div>
          )}

          {!loading && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Antrean</th>
                    <th className="p-3">Dokter</th>
                    <th className="p-3">Layanan</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0"
                    >
                      <td className="p-3 text-slate-700">
                        {new Date(
                          item.tanggal + "T00:00:00"
                        ).toLocaleDateString("id-ID")}
                      </td>

                      <td className="p-3 font-bold text-blue-700">
                        #{item.nomor_antrean}
                      </td>

                      <td className="p-3 text-slate-700">
                        {item.dokter?.nama ?? "-"}
                      </td>

                      <td className="p-3 text-slate-700">
                        {item.layanan?.nama ?? "-"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${warnaStatus(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
