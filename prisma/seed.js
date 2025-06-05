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
    where: { email: 'testadmin@gmail.com' },
    update: {
      name: 'Test Admin',
      role: 'admin',
      status: 'active',
      password: hash,
      emailVerified: true,
      provider: 'credentials',
    },
    create: {
      email: 'testadmin@gmail.com',
      emailVerified: true,
      name: 'Test Admin',
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

  const studentPassword = 'student123';
  const studentHash = await bcrypt.hash(studentPassword, 12);

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {
      name: 'Test Student 1',
      role: 'student',
      status: 'active',
      password: studentHash,
      emailVerified: true,
      provider: 'credentials',
    },
    create: {
      email: 'student1@example.com',
      emailVerified: true,
      name: 'Test Student 1',
      role: 'student',
      status: 'active',
      password: studentHash,
      provider: 'credentials',
    }
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {
      name: 'Test Student 2',
      role: 'student',
      status: 'active',
      password: studentHash,
      emailVerified: true,
      provider: 'credentials',
    },
    create: {
      email: 'student2@example.com',
      emailVerified: true,
      name: 'Test Student 2',
      role: 'student',
      status: 'active',
      password: studentHash,
      provider: 'credentials',
    }
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'student3@example.com' },
    update: {
      name: 'Test Student 3',
      role: 'student',
      status: 'active',
      password: studentHash,
      emailVerified: true,
      provider: 'credentials',
    },
    create: {
      email: 'student3@example.com',
      emailVerified: true,
      name: 'Test Student 3',
      role: 'student',
      status: 'active',
      password: studentHash,
      provider: 'credentials',
    }
  });

  const teacherPassword = 'teacher123';
  const teacherHash = await bcrypt.hash(teacherPassword, 12);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher1@example.com' },
    update: {
      name: 'Test Teacher',
      role: 'teacher',
      status: 'active',
      password: teacherHash,
      emailVerified: true,
      provider: 'credentials',
    },
    create: {
      email: 'teacher1@example.com',
      emailVerified: true,
      name: 'Test Teacher',
      role: 'teacher',
      status: 'active',
      password: teacherHash,
      provider: 'credentials',
    }
  });

  console.log('Created/updated admin users:', { admin1, admin2 })
  console.log('Created/updated students:', { student1, student2, student3 })
  console.log('Created/updated teacher:', teacher)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
