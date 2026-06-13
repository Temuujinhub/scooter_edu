import Link from 'next/link';
import { BrandLogo } from './brand-logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-950 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo variant="light" />
          <p className="mt-4 max-w-sm text-sm text-brand-200/80">
            Монгол Улсын цахилгаан скүүтэр хэрэглэгчдийг аюулгүй жолоодогч болгох — онлайнаар
            хурдан, офлайнаар баталгаатай.
          </p>
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
            <li>info@scooteredu.mn</li>
            <li>7011-0000</li>
            <li>Улаанбаатар, Монгол</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
