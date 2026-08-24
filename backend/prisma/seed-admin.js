const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@aescion.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Super';
  const lastName = process.env.ADMIN_LAST_NAME || 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== 'SUPER_ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'SUPER_ADMIN' } });
      console.log(`Updated ${email} to SUPER_ADMIN role`);
    } else {
      console.log(`Super Admin ${email} already exists`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
      isActive: true,
      referralCode: 'SA0001',
    },
  });

  console.log(`\n✅ Super Admin created successfully!`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     SUPER_ADMIN`);
  console.log(`   ID:       ${user.id}\n`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
