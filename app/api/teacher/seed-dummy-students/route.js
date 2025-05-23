import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const dummyStudents = [
  { name: 'Alice Johnson', email: 'alice@student.com', password: '', role: 'student', createdAt: new Date() },
  { name: 'Bob Smith', email: 'bob@student.com', password: '', role: 'student', createdAt: new Date() },
  { name: 'Charlie Lee', email: 'charlie@student.com', password: '', role: 'student', createdAt: new Date() },
];

export async function POST() {
  const client = await clientPromise;
  const usersCollection = client.db('school_portal').collection('users');
  for (const student of dummyStudents) {
    const exists = await usersCollection.findOne({ email: student.email });
    if (!exists) {
      await usersCollection.insertOne(student);
    }
  }
  return NextResponse.json({ ok: true });
} 