
"use client";

import { useState } from "react";

function base64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  const base64String = (base64 + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64String);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
}

export default function PushNotificationButton() {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  async function aktifkanNotifikasi() {
    setLoading(true);
    setPesan("");

    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Browser tidak mendukung Service Worker.");
      }

      if (!("PushManager" in window)) {
        throw new Error("Browser tidak mendukung Push Notification.");
      }

      const izin = await Notification.requestPermission();

      if (izin !== "granted") {
        throw new Error("Izin notifikasi tidak diberikan.");
      }

      const registration = await navigator.serviceWorker.register(
        "/sw.js"
      );

      await navigator.serviceWorker.ready;

      const publicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("VAPID public key belum dikonfigurasi.");
      }

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(publicKey),
        });
      }

      const response = await fetch("/api/push-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan subscription.");
      }

      setPesan("Notifikasi berhasil diaktifkan!");
    } catch (error) {
      setPesan(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={aktifkanNotifikasi}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Mengaktifkan..."
          : "Aktifkan Notifikasi"}
      </button>

      {pesan && (
        <p className="mt-3 text-sm text-slate-600">
          {pesan}
        </p>
      )}
    </div>
  );
}
