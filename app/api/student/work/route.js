import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  const client = await clientPromise;
  const workCollection = client.db('school_portal').collection('saved_work');
  
  const work = await workCollection.find({ 
    studentId: new ObjectId(studentId) 
  }).sort({ createdAt: -1 }).toArray();
  
  return NextResponse.json({ work });
}

export async function POST(req) {
  const { studentId, title, description, screenshot, cohortId } = await req.json();
  
  if (!studentId || !title || !screenshot) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const client = await clientPromise;
  const workCollection = client.db('school_portal').collection('saved_work');
  
  const result = await workCollection.insertOne({
    studentId: new ObjectId(studentId),
    cohortId: cohortId ? new ObjectId(cohortId) : null,
    title,
    description: description || '',
    screenshot,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return NextResponse.json({ 
    work: {
      _id: result.insertedId,
      studentId,
      cohortId,
      title,
      description,
      screenshot,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const workId = searchParams.get('workId');
  const studentId = searchParams.get('studentId');
  
  if (!workId || !studentId) {
    return NextResponse.json({ error: 'Work ID and Student ID required' }, { status: 400 });
  }

  const client = await clientPromise;
  const workCollection = client.db('school_portal').collection('saved_work');
  
  // Delete the work only if it belongs to the student
  const result = await workCollection.deleteOne({
    _id: new ObjectId(workId),
    studentId: new ObjectId(studentId)
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'Work not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
} 