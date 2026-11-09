import { NextResponse } from "next/server";
import { hapusSesi } from "@/lib/session";

export async function POST(request: Request) {
  await hapusSesi();
  return NextResponse.redirect(new URL("/", request.url), 303);
}