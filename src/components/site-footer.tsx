import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { getSettings } from '@/lib/settings';

export async function SiteFooter() {
  const s = await getSettings();
  return (
    <footer className="border-t border-white/10 bg-brand-950 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo variant="light" />
          <p className="mt-4 max-w-sm text-sm text-brand-200/80">{s.footer_tagline}</p>
          <p className="mt-4 text-xs text-brand-300/60">
            © {new Date().getFullYear()} MediaProfessional LLC. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Платформ</h4>
          <ul className="space-y-2 text-sm text-brand-200/80">
            <li><Link href="/register" className="hover:text-white">Бүртгүүлэх</Link></li>
            <li><Link href="/login" className="hover:text-white">Нэвтрэх</Link></li>
            <li><a href="/#pricing" className="hover:text-white">Үнийн санал</a></li>
            <li><a href="/#partners" className="hover:text-white">Хамтрагчид</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Холбоо барих</h4>
          <ul className="space-y-2 text-sm text-brand-200/80">
            <li>{s.contact_email}</li>
            <li>{s.contact_phone}</li>
            <li>{s.contact_address}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
