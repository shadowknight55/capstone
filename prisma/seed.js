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
      emailVerified: true
    },
    create: {
      email: 'admin@school.edu',
      emailVerified: true,
      name: 'School Admin',
      role: 'admin',
      status: 'active',
      password: hash
    }
  })

  const admin2 = await prisma.user.upsert({
    where: { email: 'testadmin@gmail.com' },
    update: {
      name: 'Test Admin',
      role: 'admin',
      status: 'active',
      password: hash,
      emailVerified: true
    },
    create: {
      email: 'testadmin@gmail.com',
      emailVerified: true,
      name: 'Test Admin',
      role: 'admin',
      status: 'active',
      password: hash
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

  const studentPassword = 'student123';
  const studentHash = await bcrypt.hash(studentPassword, 12);

  const student = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {
      name: 'Test Student',
      role: 'student',
      status: 'active',
      password: studentHash,
      emailVerified: true
    },
    create: {
      email: 'student1@example.com',
      emailVerified: true,
      name: 'Test Student',
      role: 'student',
      status: 'active',
      password: studentHash
    }
  });

  console.log('Created/updated admin users:', { admin1, admin2 })
  console.log('Created/updated student user:', student)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
