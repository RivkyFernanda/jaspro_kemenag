import bcrypt from 'bcryptjs';

/**
 * Verifikasi plain password dengan hash (bcrypt)
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password comparison failed:', error);
    return false;
  }
}

/**
 * Hash password baru
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
}

