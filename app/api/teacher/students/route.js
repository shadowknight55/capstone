import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  const client = await clientPromise;
  const usersCollection = client.db('school_portal').collection('users');
  const students = await usersCollection.find({ role: 'student' }).toArray();
  return NextResponse.json({ students });
} 