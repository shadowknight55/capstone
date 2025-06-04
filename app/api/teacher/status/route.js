import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const usersCollection = client.db("school_portal").collection("users");
    const pendingTeachersCollection = client.db("school_portal").collection("pending_teachers");

    // Check if teacher is in the main users collection
    const teacher = await usersCollection.findOne({ 
      email: token.email,
      role: 'teacher'
    });

    if (teacher) {
      return NextResponse.json({ 
        status: 'active',
        approvedAt: teacher.approvedAt,
        approvedBy: teacher.approvedBy
      });
    }

    // Check if teacher is pending
    const pendingTeacher = await pendingTeachersCollection.findOne({ 
      email: token.email,
      status: 'pending'
    });

    if (pendingTeacher) {
      return NextResponse.json({ status: 'pending' });
    }

    // Check if teacher was rejected
    const rejectedTeacher = await pendingTeachersCollection.findOne({ 
      email: token.email,
      status: 'rejected'
    });

    if (rejectedTeacher) {
      return NextResponse.json({ 
        status: 'rejected',
        rejectedAt: rejectedTeacher.rejectedAt,
        rejectedBy: rejectedTeacher.rejectedBy
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