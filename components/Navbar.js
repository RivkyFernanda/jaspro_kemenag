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
  SendHorizontal,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown states
  const [jasproDropdownOpen, setJasproDropdownOpen] = useState(false);
  const [suratDropdownOpen, setSuratDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const jasproRef = useRef(null);
  const suratRef = useRef(null);
  const userRef = useRef(null);

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
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
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
  const isAdminActive = pathname === '/admin';

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-md border-b border-emerald-700/50 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo Kemenag & Judul Brand */}
          <Link href="/input" className="flex items-center space-x-3.5 group cursor-pointer transition">
            <div className="relative w-11 h-11 shrink-0 bg-white/10 rounded-xl p-1.5 flex items-center justify-center border border-white/20 shadow-xs group-hover:scale-105 transition duration-200">
              <img
                src="/logo_kemenag.png"
                alt="Logo Kemenag"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base md:text-lg tracking-wider text-white">
                  KEMENAG
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PORTAL
                </span>
              </div>
              <span className="text-xs text-emerald-200/90 font-medium tracking-tight">
                Sistem Jaspro & Tata Persuratan
              </span>
            </div>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            
            {/* 1. Menu Laporan Jaspro */}
            <div className="relative" ref={jasproRef}>
              <button
                type="button"
                onClick={() => {
                  setJasproDropdownOpen(!jasproDropdownOpen);
                  setSuratDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isJasproActive
                    ? 'bg-emerald-950/80 text-white shadow-inner border border-emerald-600/40'
                    : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-lg ${isJasproActive ? 'bg-emerald-600 text-white' : 'bg-emerald-800/80 text-emerald-200'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <span>Laporan Jaspro</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${jasproDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {jasproDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Jasa Profesi (Jaspro)
                  </div>
                  <Link
                    href="/input"
                    onClick={() => setJasproDropdownOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition font-medium ${
                      pathname === '/input' 
                        ? 'bg-emerald-50 text-emerald-800 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <FilePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm leading-tight">Input Laporan</div>
                      <div className="text-[11px] text-slate-400 font-normal">Pencatatan tugas nikah</div>
                    </div>
                  </Link>
                  <Link
                    href="/rekap"
                    onClick={() => setJasproDropdownOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition font-medium ${
                      pathname === '/rekap' 
                        ? 'bg-emerald-50 text-emerald-800 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm leading-tight">Rekapitulasi</div>
                      <div className="text-[11px] text-slate-400 font-normal">Filter, edit, & ekspor excel</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Menu Tata Persuratan */}
            <div className="relative" ref={suratRef}>
              <button
                type="button"
                onClick={() => {
                  setSuratDropdownOpen(!suratDropdownOpen);
                  setJasproDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSuratActive
                    ? 'bg-emerald-950/80 text-white shadow-inner border border-emerald-600/40'
                    : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-lg ${isSuratActive ? 'bg-teal-600 text-white' : 'bg-emerald-800/80 text-teal-200'}`}>
                  <Mail className="w-4 h-4" />
                </div>
                <span>Tata Persuratan</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${suratDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {suratDropdownOpen && (
                <div className="absolute left-0 mt-2 w-60 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Administrasi Surat
                  </div>
                  <Link
                    href="/surat-masuk"
                    onClick={() => setSuratDropdownOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition font-medium ${
                      pathname === '/surat-masuk' 
                        ? 'bg-emerald-50 text-emerald-800 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm leading-tight">Surat Masuk</div>
                      <div className="text-[11px] text-slate-400 font-normal">Agenda & disposisi pimpinan</div>
                    </div>
                  </Link>
                  <Link
                    href="/surat-keluar"
                    onClick={() => setSuratDropdownOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition font-medium ${
                      pathname === '/surat-keluar' 
                        ? 'bg-emerald-50 text-emerald-800 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                    }`}
                  >
                    <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                      <SendHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm leading-tight">Surat Keluar</div>
                      <div className="text-[11px] text-slate-400 font-normal">Distribusi & penomoran arsip</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Kelola Master Data */}
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isAdminActive
                  ? 'bg-emerald-950/80 text-white shadow-inner border border-emerald-600/40'
                  : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-lg ${isAdminActive ? 'bg-emerald-600 text-white' : 'bg-emerald-800/80 text-emerald-200'}`}>
                <Database className="w-4 h-4" />
              </div>
              <span>Kelola Master</span>
            </Link>
          </nav>

          {/* User Account Menu (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3" ref={userRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2.5 bg-emerald-950/60 hover:bg-emerald-950/90 px-3.5 py-2 rounded-xl border border-emerald-700/60 transition cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600/80 flex items-center justify-center text-emerald-100 font-bold text-xs uppercase shadow-xs">
                  {currentUser?.username?.slice(0, 2) || 'AD'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser?.nama_lengkap || currentUser?.username || 'Pegawai Kemenag'}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-medium capitalize flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                    <span>{currentUser?.role || 'Admin'}</span>
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300 ml-1" />
              </button>

              {/* User Dropdown Box */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">
                      {currentUser?.nama_lengkap || currentUser?.username}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Hak Akses: <strong className="capitalize text-emerald-700">{currentUser?.role || 'Admin'}</strong>
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setChangePasswordOpen(true);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-xl transition cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-emerald-600" />
                      <span>Ganti Password Akun</span>
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar dari Sistem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tombol Hamburger Mobile */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 focus:outline-none cursor-pointer transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Navigasi Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-t border-emerald-800/80 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top duration-200">
          
          {/* User Profile Banner Mobile */}
          {currentUser && (
            <div className="flex items-center justify-between p-3 bg-emerald-900/60 rounded-xl border border-emerald-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.username?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {currentUser.nama_lengkap || currentUser.username}
                  </div>
                  <div className="text-[10px] text-emerald-300 capitalize">
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setChangePasswordOpen(true);
                }}
                className="text-xs bg-emerald-800 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
            </div>
          )}

          {/* Section Jaspro */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-1">
              Menu Laporan Jaspro
            </div>
            <div className="space-y-1">
              <Link
                href="/input"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname === '/input' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-100 hover:bg-emerald-900'
                }`}
              >
                <FilePlus className="w-4 h-4 text-emerald-400" />
                <span>Input Laporan Jaspro</span>
              </Link>
              <Link
                href="/rekap"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname === '/rekap' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-100 hover:bg-emerald-900'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Rekapitulasi Jaspro</span>
              </Link>
            </div>
          </div>

          {/* Section Persuratan */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400 px-2 py-1 border-t border-emerald-900 pt-2">
              Menu Tata Persuratan
            </div>
            <div className="space-y-1">
              <Link
                href="/surat-masuk"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname === '/surat-masuk' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-100 hover:bg-emerald-900'
                }`}
              >
                <Inbox className="w-4 h-4 text-blue-400" />
                <span>Surat Masuk</span>
              </Link>
              <Link
                href="/surat-keluar"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                  pathname === '/surat-keluar' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-100 hover:bg-emerald-900'
                }`}
              >
                <SendHorizontal className="w-4 h-4 text-amber-400" />
                <span>Surat Keluar</span>
              </Link>
            </div>
          </div>

          {/* Section Master */}
          <div className="border-t border-emerald-900 pt-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium ${
                pathname === '/admin' ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-100 hover:bg-emerald-900'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Kelola Master Data</span>
            </Link>
          </div>

          {/* Tombol Logout */}
          <div className="pt-2 border-t border-emerald-900">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-600/90 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Aplikasi</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Ganti Password */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </header>
  );
}
