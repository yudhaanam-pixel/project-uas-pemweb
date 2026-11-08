
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ambilSesi } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const sesi = await ambilSesi();

    if (!sesi?.uid || sesi.peran !== "pasien") {
      return NextResponse.json(
        { error: "Silakan login sebagai pasien." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const endpoint = body.endpoint;
    const p256dh = body.keys?.p256dh;
    const auth = body.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: "Data subscription tidak lengkap." },
        { status: 400 }
      );
    }

    if (
      typeof endpoint !== "string" ||
      typeof p256dh !== "string" ||
      typeof auth !== "string" ||
      endpoint.length > 2048 ||
      p256dh.length > 512 ||
      auth.length > 512 ||
      !endpoint.startsWith("https://")
    ) {
      return NextResponse.json(
        { error: "Format subscription tidak valid." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          pengguna_id: sesi.uid,
          endpoint,
          p256dh,
          auth,
          diperbarui_pada: new Date().toISOString(),
        },
        {
          onConflict: "pengguna_id,endpoint",
        }
      );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Push subscription berhasil disimpan.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan subscription.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const sesi = await ambilSesi();

    if (!sesi?.uid) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.endpoint || typeof body.endpoint !== "string") {
      return NextResponse.json(
        { error: "Endpoint subscription wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("pengguna_id", sesi.uid)
      .eq("endpoint", body.endpoint);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Subscription berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal menghapus subscription.",
      },
      { status: 500 }
    );
  }
}
