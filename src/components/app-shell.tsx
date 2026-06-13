'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import { BrandLogo } from './brand-logo';
import { useUser, logout, type MeUser } from '@/lib/client';
import { cn } from '@/lib/utils';
import { Spinner } from './ui';
import { LogOut, Menu, X } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export function AppShell({
  nav,
  children,
  requireRole,
  title,
}: {
  nav: NavItem[];
  children: React.ReactNode;
  requireRole?: string;
  title?: string;
}) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && user && requireRole && user.role !== requireRole) {
      router.replace('/dashboard');
    }
  }, [loading, user, requireRole, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link href="/">
            <BrandLogo />
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 p-3">
          <UserCard user={user} />
        </div>
      </aside>

      {/* Main */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <LogOut className="h-4 w-4" /> Гарах
          </button>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">{children}</main>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function UserCard({ user }: { user: MeUser }) {
  const roleLabel =
    user.role === 'ADMIN' ? 'Админ' : user.role === 'INSTRUCTOR' ? 'Багш' : 'Суралцагч';
  const initial = user.firstName?.charAt(0) ?? 'Х';
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">
        {initial}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-xs text-slate-500">{roleLabel}</div>
      </div>
    </div>
  );
}
