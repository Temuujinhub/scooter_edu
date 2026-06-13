import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  MapPin,
  Award,
  User,
  Users,
  GraduationCap,
  HelpCircle,
  Building2,
  BarChart3,
  CreditCard,
  QrCode,
  Tags,
  Settings,
  Plug,
} from 'lucide-react';
import type { NavItem } from './app-shell';

export const studentNav: NavItem[] = [
  { href: '/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
  { href: '/courses', label: 'Сургалт', icon: BookOpen },
  { href: '/exam', label: 'Шалгалт', icon: ClipboardCheck },
  { href: '/practice', label: 'Практик дадлага', icon: MapPin },
  { href: '/certificates', label: 'Гэрчилгээ', icon: Award },
  { href: '/profile', label: 'Профайл ба урамшуулал', icon: User },
];

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Хяналтын самбар', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Хэрэглэгчид', icon: Users },
  { href: '/admin/courses', label: 'Курс ба модуль', icon: GraduationCap },
  { href: '/admin/packages', label: 'Үнийн багцууд', icon: Tags },
  { href: '/admin/questions', label: 'Асуултын сан', icon: HelpCircle },
  { href: '/admin/partners', label: 'Хамтрагчид', icon: Building2 },
  { href: '/admin/api', label: 'API холболт', icon: Plug },
  { href: '/admin/certificates', label: 'Гэрчилгээ', icon: Award },
  { href: '/admin/payments', label: 'Төлбөр', icon: CreditCard },
  { href: '/admin/reports', label: 'Тайлан', icon: BarChart3 },
  { href: '/admin/settings', label: 'Сайтын тохиргоо', icon: Settings },
];

export const instructorNav: NavItem[] = [
  { href: '/instructor', label: 'Дадлагын жагсаалт', icon: MapPin },
  { href: '/instructor/scan', label: 'QR баталгаажуулалт', icon: QrCode },
];
