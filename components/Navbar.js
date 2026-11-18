'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  FilePlus, 
  LogOut, 
  Database, 
  Menu, 
  X, 
  UserCheck, 
  Mail, 
  ChevronDown,
  Inbox,
  SendHorizontal
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states
  const [jasproDropdownOpen, setJasproDropdownOpen] = useState(false);
  const [suratDropdownOpen, setSuratDropdownOpen] = useState(false);

  const jasproRef = useRef(null);
  const suratRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('jaspro_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (jasproRef.current && !jasproRef.current.contains(event.target)) {
        setJasproDropdownOpen(false);
      }
      if (suratRef.current && !suratRef.current.contains(event.target)) {
        setSuratDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jaspro_user');
    router.push('/login');
  };

  // Jangan render navbar di halaman login
  if (pathname === '/login') return null;

  const isJasproActive = pathname === '/input' || pathname === '/rekap';
  const isSuratActive = pathname.startsWith('/surat');

  return (
    <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Kemenag & Judul Brand */}
          <Link href="/input" className="flex items-center space-x-3 cursor-pointer">
            <div className="relative w-10 h-10 shrink-0 bg-white/10 rounded-lg p-1 flex items-center justify-center">
              <img
                src="/logo_kemenag.png"
                alt="Logo Kemenag"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide block leading-tight">
                JASPRO & PERSURATAN KEMENAG
              </span>
              <span className="text-xs text-emerald-200">
                Kementerian Agama Republik Indonesia
              </span>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            
            {/* 1. Menu Laporan Jaspro (Dropdown) */}
            <div className="relative" ref={jasproRef}>
              <button
                type="button"
                onClick={() => {
                  setJasproDropdownOpen(!jasproDropdownOpen);
                  setSuratDropdownOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isJasproActive
                    ? 'bg-emerald-950 text-white font-semibold'
                    : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Laporan Jaspro</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {jasproDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in duration-100">
                  <Link
                    href="/input"
                    onClick={() => setJasproDropdownOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-800 transition ${
                      pathname === '/input' ? 'font-semibold text-emerald-700 bg-emerald-50' : ''
                    }`}
                  >
                    <FilePlus className="w-4 h-4 text-emerald-600" />
                    <span>Input Laporan Jaspro</span>
                  </Link>
                  <Link
                    href="/rekap"
                    onClick={() => setJasproDropdownOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-800 transition ${
                      pathname === '/rekap' ? 'font-semibold text-emerald-700 bg-emerald-50' : ''
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Rekapitulasi Jaspro</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Menu Laporan Surat Masuk & Surat Keluar (Dropdown) */}
            <div className="relative" ref={suratRef}>
              <button
                type="button"
                onClick={() => {
                  setSuratDropdownOpen(!suratDropdownOpen);
                  setJasproDropdownOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  isSuratActive
                    ? 'bg-emerald-950 text-white font-semibold'
                    : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4 text-teal-300" />
                <span>Surat Masuk & Keluar</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {suratDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in duration-100">
                  <Link
                    href="/surat-masuk"
                    onClick={() => setSuratDropdownOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-800 transition ${
                      pathname === '/surat-masuk' ? 'font-semibold text-emerald-700 bg-emerald-50' : ''
                    }`}
                  >
                    <Inbox className="w-4 h-4 text-blue-600" />
                    <span>Surat Masuk</span>
                  </Link>
                  <Link
                    href="/surat-keluar"
                    onClick={() => setSuratDropdownOpen(false)}
                    className={`flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-800 transition ${
                      pathname === '/surat-keluar' ? 'font-semibold text-emerald-700 bg-emerald-50' : ''
                    }`}
                  >
                    <SendHorizontal className="w-4 h-4 text-amber-600" />
                    <span>Surat Keluar</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Kelola Master Data */}
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/admin'
                  ? 'bg-emerald-950 text-white font-semibold'
                  : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-300" />
              <span>Kelola Master</span>
            </Link>
          </div>

          {/* User Info & Logout Button */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2 text-xs text-emerald-100 bg-emerald-900/50 px-3 py-1.5 rounded-full border border-emerald-700">
                <UserCheck className="w-4 h-4 text-emerald-300" />
                <span>
                  {currentUser.nama_lengkap || currentUser.username} (
                  <span className="capitalize">{currentUser.role}</span>)
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
              title="Keluar dari sistem"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>

          {/* Tombol Hamburger Mobile */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-700 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Navigasi Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-700 px-4 pt-2 pb-4 space-y-2">
          {/* Section Jaspro */}
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 px-2 pt-1">
            Laporan Jaspro
          </div>
          <Link
            href="/input"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/input' ? 'bg-emerald-950 text-white' : 'text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>Input Laporan Jaspro</span>
          </Link>
          <Link
            href="/rekap"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/rekap' ? 'bg-emerald-950 text-white' : 'text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rekapitulasi Jaspro</span>
          </Link>

          {/* Section Persuratan */}
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 px-2 pt-2 border-t border-emerald-800">
            Persuratan
          </div>
          <Link
            href="/surat-masuk"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/surat-masuk' ? 'bg-emerald-950 text-white' : 'text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Surat Masuk</span>
          </Link>
          <Link
            href="/surat-keluar"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/surat-keluar' ? 'bg-emerald-950 text-white' : 'text-emerald-100 hover:bg-emerald-800'
            }`}
          >
            <SendHorizontal className="w-4 h-4" />
            <span>Surat Keluar</span>
          </Link>

          {/* Section Master */}
          <div className="pt-2 border-t border-emerald-800">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/admin' ? 'bg-emerald-950 text-white' : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Kelola Master Data</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-emerald-800 flex items-center justify-between">
            {currentUser && (
              <span className="text-xs text-emerald-200">
                {currentUser.nama_lengkap || currentUser.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
