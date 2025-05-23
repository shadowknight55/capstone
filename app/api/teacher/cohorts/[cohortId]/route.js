import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(_req, { params }) {
  const { cohortId } = params;
  if (!cohortId) return NextResponse.json({ error: 'Missing cohortId' }, { status: 400 });
  const client = await clientPromise;
  const cohortsCollection = client.db('school_portal').collection('cohorts');
  await cohortsCollection.deleteOne({ _id: new ObjectId(cohortId) });
  return NextResponse.json({ ok: true });
} 