import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  const work = await prisma.savedWork.findMany({
    where: { studentId: Number(studentId) },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json({ work });
}

export async function POST(req) {
  const { studentId, title, description, screenshot, cohortId } = await req.json();
  
  if (!studentId || !title || !screenshot) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const newWork = await prisma.savedWork.create({
    data: {
      studentId: Number(studentId),
      cohortId: cohortId ? Number(cohortId) : null,
      title,
      description: description || '',
      screenshot
    }
  });

  return NextResponse.json({ work: newWork });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const workId = searchParams.get('workId');
  const studentId = searchParams.get('studentId');
  
  if (!workId || !studentId) {
    return NextResponse.json({ error: 'Work ID and Student ID required' }, { status: 400 });
  }

  const deleted = await prisma.savedWork.deleteMany({
    where: {
      id: Number(workId),
      studentId: Number(studentId)
    }
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Work not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
} 