import { NextResponse } from "next/server";
import { ambilSesi } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const sesi = await ambilSesi();
  if (!sesi || typeof sesi.uid !== "string") {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  let body: any;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Body tidak valid" }, { status: 400 }); }

  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (![endpoint, p256dh, auth].every((v) => typeof v === "string" && v.length > 0)
      || !endpoint.startsWith("https://")) {
    return NextResponse.json({ error: "Subscription tidak valid" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscription")
    .upsert({ pengguna_id: sesi.uid, endpoint, p256dh, auth }, { onConflict: "endpoint" });

  if (error) return NextResponse.json({ error: "Gagal menyimpan subscription" }, { status: 500 });
  return NextResponse.json({ success: true });
}