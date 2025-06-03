import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get('cohortId');
    
    if (!cohortId) {
      return NextResponse.json({ error: 'Cohort ID required' }, { status: 400 });
    }

    // Validate cohortId format
    if (!ObjectId.isValid(cohortId)) {
      return NextResponse.json({ error: 'Invalid cohort ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('school_portal');
    
    // First, get the cohort to verify it exists
    const cohort = await db.collection('cohorts').findOne({ _id: new ObjectId(cohortId) });
    if (!cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    // Get all student work for this cohort
    const work = await db.collection('saved_work')
      .find({ cohortId: new ObjectId(cohortId) })
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();

    // Get student information for each work item
    const studentIds = [...new Set(work.map(w => w.studentId))];
    const students = await db.collection('users')
      .find({ _id: { $in: studentIds.map(id => new ObjectId(id)) } })
      .project({ name: 1, email: 1 })
      .toArray();

    // Create a map of student information
    const studentMap = students.reduce((acc, student) => {
      acc[student._id.toString()] = student;
      return acc;
    }, {});

    // Combine work with student information
    const workWithStudents = work.map(item => ({
      ...item,
      student: studentMap[item.studentId] || { name: 'Unknown Student', email: 'Unknown' }
    }));

    return NextResponse.json({ 
      cohort: { name: cohort.name },
      work: workWithStudents 
    });
  } catch (error) {
    console.error('Error in teacher work API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 