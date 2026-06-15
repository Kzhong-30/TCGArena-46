import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateVerificationToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
