import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Validate studentId format
    if (!ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const cohortsCollection = client.db('school_portal').collection('cohorts');
    
    const cohorts = await cohortsCollection.find({
      students: new ObjectId(studentId)
    }).toArray();
    
    return NextResponse.json({ cohorts: cohorts || [] });
  } catch (error) {
    console.error('Error in cohorts API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 