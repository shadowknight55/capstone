import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

// List of admin emails who can approve teacher accounts
const ADMIN_EMAILS = [
  'admin@school.edu',
  'testadmin@gmail.com',  // Added test admin email
  // Add your admin emails here
];

export async function POST(req) {
  try {
    // Verify admin status
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !ADMIN_EMAILS.includes(token.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { teacherEmail, action } = await req.json();
    if (!teacherEmail || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Find the pending teacher
    const pendingTeacher = await prisma.pendingTeacher.findUnique({
      where: { 
        email: teacherEmail,
        status: 'pending'
      }
    });

    if (!pendingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found or already processed' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Create teacher account
      await prisma.user.create({
        data: {
          name: pendingTeacher.name,
          email: pendingTeacher.email,
          password: pendingTeacher.password,
          role: 'teacher',
          status: 'active',
          emailVerified: true,
          approvedBy: token.email,
          approvedAt: new Date()
        }
      });

      // Delete pending teacher record
      await prisma.pendingTeacher.delete({
        where: { id: pendingTeacher.id }
      });

      // TODO: Send approval email to teacher

      return NextResponse.json({
        message: 'Teacher account approved successfully'
      });
    } else {
      // Reject the teacher
      await prisma.pendingTeacher.update({
        where: { id: pendingTeacher.id },
        data: { 
          status: 'rejected',
          rejectedBy: token.email,
          rejectedAt: new Date()
        }
      });

      // TODO: Send rejection email to teacher

      return NextResponse.json({
        message: 'Teacher account rejected'
      });
    }
  } catch (error) {
    console.error('Teacher approval error:', error);
    return NextResponse.json(
      { error: 'Error processing teacher approval' },
      { status: 500 }
    );
  }
}

// Get list of pending teachers
export async function GET(req) {
  try {
    // Verify admin status
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !ADMIN_EMAILS.includes(token.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const pendingTeachers = await prisma.pendingTeacher.findMany({
      where: { status: 'pending' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // Exclude password
      }
    });

    return NextResponse.json({ pendingTeachers });
  } catch (error) {
    console.error('Error fetching pending teachers:', error);
    return NextResponse.json(
      { error: 'Error fetching pending teachers' },
      { status: 500 }
    );
  }
} 