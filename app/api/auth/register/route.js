import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

// List of approved teacher email domains
const APPROVED_TEACHER_DOMAINS = [
  'teacher.com',
  'school.edu',
  'gmail.com'  // Adding gmail.com temporarily for testing
];

// List of admin emails who can approve teacher accounts
const ADMIN_EMAILS = [
  'admin@school.edu',
  'testadmin@gmail.com'  // Adding test admin email
];

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const usersCollection = client.db("school_portal").collection("users");
    const pendingTeachersCollection = client.db("school_portal").collection("pending_teachers");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Special handling for admin registration
    if (role === 'admin' && email === 'testadmin@gmail.com') {
      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        status: 'active'
      });

      return NextResponse.json(
        { message: 'Admin account created successfully', userId: result.insertedId },
        { status: 201 }
      );
    }

    // Special handling for teacher registration
    if (role === 'teacher') {
      // Extract domain from email
      const emailDomain = email.split('@')[1]?.toLowerCase();
      
      // Check if domain is approved
      if (!APPROVED_TEACHER_DOMAINS.includes(emailDomain)) {
        return NextResponse.json(
          { error: 'Unauthorized email domain for teacher registration' },
          { status: 403 }
        );
      }

      // Create a pending teacher account that requires admin approval
      const hashedPassword = await bcrypt.hash(password, 12);
      await pendingTeachersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        role: 'teacher',
        status: 'pending',
        createdAt: new Date(),
        verificationToken: crypto.randomUUID(), // Generate a unique verification token
      });

      // TODO: Send email to admin for approval
      // TODO: Send verification email to teacher

      return NextResponse.json(
        { 
          message: 'Teacher registration submitted for approval',
          status: 'pending'
        },
        { status: 202 }
      );
    }

    // Regular student registration
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      createdAt: new Date(),
      status: 'active'
    });

    return NextResponse.json(
      { message: 'Student account created successfully', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
} 