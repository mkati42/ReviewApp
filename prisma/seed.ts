import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = 'admin@reviewboard.com';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('👑 Admin user created/updated:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log(`👤 Name: Admin User`);
  console.log(`🛡️  Role: ADMIN`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 Use these credentials to access admin panel');

  // Create demo user for testing
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@reviewboard.com' },
    update: {},
    create: {
      email: 'user@reviewboard.com',
      name: 'Demo User',
      password: await bcrypt.hash('user123', 12),
      role: 'USER',
    },
  });

  console.log('👤 Demo user created/updated:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email: user@reviewboard.com`);
  console.log(`🔑 Password: user123`);
  console.log(`👤 Name: Demo User`);
  console.log(`🛡️  Role: USER`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log(`✅ Seeded users successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });