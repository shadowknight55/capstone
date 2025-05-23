import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  const { cohortId, studentId } = await req.json();
  if (!cohortId || !studentId) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  const client = await clientPromise;
  const cohortsCollection = client.db('school_portal').collection('cohorts');
  await cohortsCollection.updateOne(
    { _id: new ObjectId(cohortId) },
    { $addToSet: { students: new ObjectId(studentId) } }
  );
  return NextResponse.json({ ok: true });
} 