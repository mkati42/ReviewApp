import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const rules = [
    {
      name: 'Yüksek Tutar - Kritik',
      description: '1 milyon TL üzeri tutarlar yüksek risk',
      condition: JSON.stringify({
        field: 'amount',
        operator: 'gt',
        value: 1000000,
      }),
      riskImpact: 3,
      isActive: true,
    },
    {
      name: 'Yüksek Tutar - Orta',
      description: '500K - 1M TL arası tutarlar orta risk',
      condition: JSON.stringify({
        field: 'amount',
        operator: 'gt',
        value: 500000,
      }),
      riskImpact: 2,
      isActive: true,
    },
    {
      name: 'Risk Kelimesi Tespiti',
      description: 'Açıklamada "risk" kelimesi varsa ek puan',
      condition: JSON.stringify({
        field: 'description',
        operator: 'contains',
        value: 'risk',
      }),
      riskImpact: 1,
      isActive: true,
    },
    {
      name: 'Deneyimsiz Ekip',
      description: 'Açıklamada "deneyimsiz" kelimesi varsa',
      condition: JSON.stringify({
        field: 'description',
        operator: 'contains',
        value: 'deneyimsiz',
      }),
      riskImpact: 2,
      isActive: true,
    },
    {
      name: 'Garantili Proje',
      description: 'Garantili etiketli projeler düşük risk',
      condition: JSON.stringify({
        field: 'tags',
        operator: 'in',
        value: ['guaranteed', 'garantili'],
      }),
      riskImpact: -2,
      isActive: true,
    },
    {
      name: 'Düşük Tutar',
      description: '50K TL altı tutarlar düşük risk',
      condition: JSON.stringify({
        field: 'amount',
        operator: 'lt',
        value: 50000,
      }),
      riskImpact: -1,
      isActive: true,
    },
  ];

  for (const rule of rules) {
    await prisma.Rule.upsert({
      where: { name: rule.name },
      update: {},
      create: rule,
    });
  }

  console.log(`✅ Seeded ${rules.length} rules successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });