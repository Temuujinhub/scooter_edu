'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BrandLogo } from './brand-logo';
import { Button } from './ui';
import { useUser } from '@/lib/client';
import { Menu, X } from 'lucide-react';

export function SiteNav() {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/#features', label: 'Боломжууд' },
    { href: '/#journey', label: 'Сургалтын зам' },
    { href: '/#partners', label: 'Хамтрагчид' },
    { href: '/#pricing', label: 'Үнэ' },
    { href: '/about', label: 'Тухай' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-950/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <BrandLogo variant="light" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-brand-100 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!loading && user ? (
            <Link href={user.role === 'ADMIN' ? '/admin' : user.role === 'INSTRUCTOR' ? '/instructor' : '/dashboard'}>
              <Button size="sm" variant="success">
                Хяналтын самбар
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                  Нэвтрэх
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="success">
                  Бүртгүүлэх
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Цэс"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-brand-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-brand-100"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="flex-1">
                <Button size="sm" variant="outline" className="w-full">
                  Нэвтрэх
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button size="sm" variant="success" className="w-full">
                  Бүртгүүлэх
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
