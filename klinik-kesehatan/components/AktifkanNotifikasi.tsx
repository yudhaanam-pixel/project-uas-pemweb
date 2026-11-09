"use client";
import { useEffect, useState } from "react";

type State = "memuat" | "tidak-didukung" | "belum" | "aktif" | "ditolak" | "proses" | "error";

function urlBase64ToUint8Array(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function AktifkanNotifikasi() {
  const [state, setState] = useState<State>("memuat");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("tidak-didukung"); return;
    }
    if (Notification.permission === "denied") { setState("ditolak"); return; }
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "aktif" : "belum"))
      .catch(() => setState("error"));
  }, []);

  async function aktifkan() {
    setState("proses");
    try {
      const izin = await Notification.requestPermission();
      if (izin !== "granted") { setState("ditolak"); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error();
      setState("aktif");
    } catch {
      setState("error");
    }
  }

  if (state === "memuat" || state === "tidak-didukung") return null;

  return (
    <div className="rounded border p-3 text-sm">
      {state === "aktif" && <p>🔔 Notifikasi aktif.</p>}
      {state === "ditolak" && <p>Notifikasi diblokir. Aktifkan lewat pengaturan situs di browser.</p>}
      {state === "error" && <p role="alert" className="text-red-500">Gagal mengaktifkan notifikasi. Coba lagi.</p>}
      {(state === "belum" || state === "error" || state === "proses") && (
        <button onClick={aktifkan} disabled={state === "proses"}
                className="rounded bg-teal-600 px-3 py-1 text-white disabled:opacity-50">
          {state === "proses" ? "Memproses..." : "Aktifkan notifikasi"}
        </button>
      )}
    </div>
  );
}