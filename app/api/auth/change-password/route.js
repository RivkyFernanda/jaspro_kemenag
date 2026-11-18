import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { userId, username, oldPassword, newPassword } = await request.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Semua kolom password wajib diisi!' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter!' },
        { status: 400 }
      );
    }

    // 1. Ambil data user dari tabel users
    let query = supabase.from('users').select('id, username, password_hash');
    if (userId) {
      query = query.eq('id', userId);
    } else {
      query = query.eq('username', username);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan di sistem' },
        { status: 404 }
      );
    }

    // 2. Verifikasi kecocokan password lama
    let isOldMatch = false;
    if (user.password_hash === oldPassword) {
      isOldMatch = true;
    } else {
      isOldMatch = await verifyPassword(oldPassword, user.password_hash);
    }

    if (!isOldMatch) {
      return NextResponse.json(
        { error: 'Password sebelumnya salah! Mohon periksa kembali password Anda.' },
        { status: 401 }
      );
    }

    // 3. Hash password baru dengan bcrypt
    const newHash = await hashPassword(newPassword);

    // 4. Update ke tabel users
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: 'Password berhasil diubah!',
    });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui password: ' + err.message },
      { status: 500 }
    );
  }
}
