import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get('cohortId');
    if (!cohortId) {
      return NextResponse.json({ error: 'Cohort ID required' }, { status: 400 });
    }
    const cohortIdNum = Number(cohortId);
    if (isNaN(cohortIdNum) || !Number.isInteger(cohortIdNum)) {
      return NextResponse.json({ error: 'Cohort ID must be a valid integer' }, { status: 400 });
    }
    // Get the cohort
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortIdNum },
      include: {
        work: {
          orderBy: { createdAt: 'desc' },
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
    if (!cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }
    return NextResponse.json({
      cohort: { name: cohort.name },
      work: cohort.work.map(item => ({
        ...item,
        student: item.student || { name: 'Unknown Student', email: 'Unknown' }
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 