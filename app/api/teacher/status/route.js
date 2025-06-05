import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if teacher is in the main users table
    const teacher = await prisma.user.findUnique({
      where: { email: token.email }
    });
    if (teacher && teacher.role === 'teacher') {
      return NextResponse.json({
        status: 'active',
        approvedAt: teacher.approvedAt,
        approvedBy: teacher.approvedBy
      });
    }

    // Check if teacher is pending
    const pendingTeacher = await prisma.pendingTeacher.findUnique({
      where: { email: token.email }
    });
    if (pendingTeacher && pendingTeacher.status === 'pending') {
      return NextResponse.json({ status: 'pending' });
    }

    // Check if teacher was rejected
    if (pendingTeacher && pendingTeacher.status === 'rejected') {
      return NextResponse.json({
        status: 'rejected',
        rejectedAt: pendingTeacher.rejectedAt,
        rejectedBy: pendingTeacher.rejectedBy
      });
    }

    // If not found in any collection
    return NextResponse.json({ status: 'unknown' });
  } catch (error) {
    console.error('Error checking teacher status:', error);
    return NextResponse.json(
      { error: 'Error checking teacher status' },
      { status: 500 }
    );
  }
} 