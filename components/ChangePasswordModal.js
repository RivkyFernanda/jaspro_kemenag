'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound, X } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password baru minimal 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok!');
      return;
    }

    const storedUser = localStorage.getItem('jaspro_user');
    if (!storedUser) {
      setErrorMsg('Sesi login telah habis, silakan login kembali.');
      return;
    }

    const user = JSON.parse(storedUser);

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah password');
      }

      setSuccessMsg('Password berhasil diperbarui! Gunakan password baru untuk login berikutnya.');
      setTimeout(() => {
        handleReset();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base">Ganti Password Akun</h3>
          </div>
          <button
            onClick={handleReset}
            className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center space-x-2 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Password Lama */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Sebelumnya (Verifikasi) *
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Baru (Minimal 6 karakter) *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ulangi Password Baru *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Perbarui Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
