import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { verifyPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Ambil data user dari tabel Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, nama_lengkap, role')
      .eq('username', username.trim())
      .single();

    if (error || !user) {
      console.warn('Login attempt failed: User not found or Supabase error:', error?.message);
      return NextResponse.json(
        { error: 'Username atau password tidak cocok (User tidak ditemukan di database)' },
        { status: 401 }
      );
    }

    // Mendukung plain-text langsung atau hash bcrypt
    let isMatch = false;
    if (user.password_hash === password) {
      isMatch = true;
    } else {
      isMatch = await verifyPassword(password, user.password_hash);
    }

    if (!isMatch) {
      console.warn('Login attempt failed: Password does not match');
      return NextResponse.json(
        { error: 'Username atau password tidak cocok' },
        { status: 401 }
      );
    }

    // Hapus password_hash dari payload respons demi keamanan
    const { password_hash, ...safeUserData } = user;

    return NextResponse.json({
      message: 'Login berhasil',
      user: safeUserData,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

