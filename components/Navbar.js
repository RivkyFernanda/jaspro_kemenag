'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  FileText, 
  FilePlus, 
  LogOut, 
  Database,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('jaspro_user');
    router.push('/login');
  };

  // Jangan render navbar di halaman login
  if (pathname === '/login') return null;

  const navLinks = [
    { href: '/input', label: 'Input Laporan', icon: FilePlus },
    { href: '/rekap', label: 'Rekapitulasi', icon: FileText },
    { href: '/admin', label: 'Kelola Master', icon: Database },
  ];

  return (
    <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Kemenag & Judul Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 shrink-0 bg-white/10 rounded-lg p-1 flex items-center justify-center">
              <img
                src="/logo_kemenag.png"
                alt="Logo Kemenag"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide block leading-tight">
                JASPRO KEMENAG
              </span>
              <span className="text-xs text-emerald-200">
                Layanan Pencatatan Jasa Profesi
              </span>
            </div>
          </div>

          {/* Navigasi Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-950 text-white font-semibold'
                      : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
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
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
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
              className="p-2 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-700 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Navigasi Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-700 px-4 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-950 text-white'
                    : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-emerald-800 flex items-center justify-between">
            {currentUser && (
              <span className="text-xs text-emerald-200">
                {currentUser.nama_lengkap || currentUser.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium"
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

