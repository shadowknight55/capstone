import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import clientPromise from '@/lib/mongodb';

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

    const client = await clientPromise;
    const pendingTeachersCollection = client.db("school_portal").collection("pending_teachers");
    const usersCollection = client.db("school_portal").collection("users");

    // Find the pending teacher
    const pendingTeacher = await pendingTeachersCollection.findOne({ 
      email: teacherEmail,
      status: 'pending'
    });

    if (!pendingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found or already processed' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Move teacher to main users collection
      await usersCollection.insertOne({
        name: pendingTeacher.name,
        email: pendingTeacher.email,
        password: pendingTeacher.password,
        role: 'teacher',
        createdAt: new Date(),
        status: 'active',
        approvedBy: token.email,
        approvedAt: new Date()
      });

      // Remove from pending collection
      await pendingTeachersCollection.deleteOne({ _id: pendingTeacher._id });

      // TODO: Send approval email to teacher

      return NextResponse.json({
        message: 'Teacher account approved successfully'
      });
    } else {
      // Reject the teacher
      await pendingTeachersCollection.updateOne(
        { _id: pendingTeacher._id },
        { 
          $set: { 
            status: 'rejected',
            rejectedBy: token.email,
            rejectedAt: new Date()
          }
        }
      );

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

    const client = await clientPromise;
    const pendingTeachersCollection = client.db("school_portal").collection("pending_teachers");
    
    const pendingTeachers = await pendingTeachersCollection
      .find({ status: 'pending' })
      .project({ password: 0 }) // Don't send passwords
      .toArray();

    return NextResponse.json({ pendingTeachers });
  } catch (error) {
    console.error('Error fetching pending teachers:', error);
    return NextResponse.json(
      { error: 'Error fetching pending teachers' },
      { status: 500 }
    );
  }
} 