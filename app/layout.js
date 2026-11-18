import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Sistem Informasi Jaspro & Persuratan | Kementerian Agama RI',
  description: 'Portal Resmi Pencatatan Jasa Profesi (Jaspro) dan Manajemen Tata Persuratan Kementerian Agama RI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-slate-100/70 text-slate-900 antialiased min-h-screen flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px] mx-auto">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-500 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-medium text-slate-600">
              © {new Date().getFullYear()} Kementerian Agama RI • Portal Jaspro & Tata Persuratan
            </span>
            <span className="text-slate-400">
              Integrasi Realtime Database Cloud Supabase
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
