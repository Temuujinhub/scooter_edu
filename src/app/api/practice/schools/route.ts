import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

// GET /api/practice/schools — Гэрээт жолооны курс (дадлагын талбай) жагсаалт
export async function GET() {
  const schools = await prisma.drivingSchool.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return ok(
    schools.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      district: s.district,
      phone: s.phone,
      capacityPerDay: s.capacityPerDay,
    }))
  );
}
