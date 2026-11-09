import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Klinik Kesehatan",
  description: "Sistem informasi pendaftaran dan antrean klinik",
};

// Perbaikan tipe data parameter children standar Next.js
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <Suspense
          fallback={<nav className="border-b px-6 py-3 font-bold bg-white text-black">Klinik</nav>}
        >
          <Navbar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
