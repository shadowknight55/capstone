import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }
    const cohorts = await prisma.cohort.findMany({
      where: {
        students: {
          some: { id: Number(studentId) }
        }
      }
    });
    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error('Error in cohorts API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 