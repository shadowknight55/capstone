import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const ADMIN_EMAILS = [
  'admin@school.edu',
  'testadmin@gmail.com',
];

export async function GET(req) {
  // List all users except Google users
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !ADMIN_EMAILS.includes(token.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      provider: true,
      status: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req) {
  // Reset password for a user
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !ADMIN_EMAILS.includes(token.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { userId, newPassword } = await req.json();
  if (!userId || !newPassword) {
    return NextResponse.json({ error: 'Missing userId or newPassword' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.provider === 'google') {
    return NextResponse.json({ error: 'User not found or is a Google user' }, { status: 404 });
  }
  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });
  return NextResponse.json({ message: 'Password updated' });
}

export async function DELETE(req) {
  // Delete a user by id
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !ADMIN_EMAILS.includes(token.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ message: 'User deleted' });
} 