import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { signToken, verifyToken, type TokenPayload } from './jwt';
import { prisma } from './prisma';

const COOKIE_NAME = 'scooteredu_token';

// Cookie-д токен суулгах
export async function setAuthCookie(payload: TokenPayload) {
  const token = await signToken(payload);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 хоног
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

// Одоогийн нэвтэрсэн хэрэглэгчийн токен мэдээллийг авах
export async function getSession(): Promise<TokenPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Бүрэн хэрэглэгчийн бичлэгийг DB-ээс авах
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub } });
}

// API route-д хамгаалалт: нэвтэрсэн эсэхийг шалгана
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'Нэвтрэх шаардлагатай' },
        { status: 401 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}

// API route-д хамгаалалт: ADMIN эрх шалгана
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }),
      session: null,
    };
  }
  if (session.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Админ эрх шаардлагатай' },
        { status: 403 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}
