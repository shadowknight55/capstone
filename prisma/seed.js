const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  // Generate a bcrypt hash for 'admin123' in this environment
  const adminPassword = 'admin123';
  const hash = await bcrypt.hash(adminPassword, 12);
  console.log('NEW HASH FOR admin123:', hash);

  // Upsert the two existing admin users
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {
      name: 'School Admin',
      role: 'admin',
      status: 'active',
      password: hash,
      emailVerified: true,
      provider: 'credentials',
    },
    create: {
      email: 'admin@school.edu',
      emailVerified: true,
      name: 'School Admin',
      role: 'admin',
      status: 'active',
      password: hash,
      provider: 'credentials',
    }
  })

  const admin2 = await prisma.user.upsert({
    where: { email: 'amy@we-conduit.org' },
    update: {
      name: 'Amy',
      role: 'admin',
      status: 'active',
      password: hash,
      emailVerified: true,
      provider: 'credentials',
    },
    create: {
      email: 'amy@we-conduit.org',
      emailVerified: true,
      name: 'Amy',
      role: 'admin',
      status: 'active',
      password: hash,
      provider: 'credentials',
    }
  })

  // Reset all admin passwords to the new hash
  await prisma.user.updateMany({
    where: { role: 'admin' },
    data: { password: hash }
  });

  // Log all admin users for verification
  const updatedAdmins = await prisma.user.findMany({ where: { role: 'admin' } });
  console.log('ADMINS AFTER PASSWORD RESET:', updatedAdmins);

  
  console.log('Created/updated admin users:', { admin1, admin2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
