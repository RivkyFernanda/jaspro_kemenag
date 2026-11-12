import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Sistem Laporan Jaspro Kemenag',
  description: 'Aplikasi Pencatatan dan Rekapitulasi Jasa Profesi Kemenag berbasis Next.js & Supabase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Kementerian Agama RI - Sistem Jasa Profesi (Jaspro)
        </footer>
      </body>
    </html>
  );
}

