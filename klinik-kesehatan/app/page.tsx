import { redirect } from 'next/navigation';

export default function Home() {
  // Memaksa halaman utama langsung melempar user ke halaman login klinik
  redirect('/login');
}
