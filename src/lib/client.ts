'use client';

import { useEffect, useState } from 'react';

// Клиент талын API дуудлагын туслах
export async function api<T = any>(
  path: string,
  options?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = options ?? {};
  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(rest.headers ?? {}),
    },
    body: json ? JSON.stringify(json) : rest.body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.error || `Алдаа гарлаа (${res.status})`);
  }
  return (data?.data ?? data) as T;
}

export interface MeUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string | null;
  role: string;
  registerNumber?: string | null;
  ageVerified?: boolean;
  xypVerified?: boolean;
  isTestUser?: boolean;
}

// Одоогийн хэрэглэгчийг авах hook
export function useUser() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) setUser(d?.data ?? null);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
}
