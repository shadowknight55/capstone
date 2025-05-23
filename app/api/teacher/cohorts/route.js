import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  const client = await clientPromise;
  const cohortsCollection = client.db('school_portal').collection('cohorts');
  const cohorts = await cohortsCollection.find({}).toArray();
  return NextResponse.json({ cohorts });
}

export async function POST(req) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const client = await clientPromise;
  const cohortsCollection = client.db('school_portal').collection('cohorts');
  await cohortsCollection.insertOne({ name, students: [] });
  const cohorts = await cohortsCollection.find({}).toArray();
  return NextResponse.json({ cohorts });
} 