import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  const { cohortId, studentId } = await req.json();
  if (!cohortId || !studentId) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  await prisma.cohort.update({
    where: { id: Number(cohortId) },
    data: {
      students: {
        disconnect: { id: Number(studentId) }
      }
    }
  });
  return NextResponse.json({ ok: true });
} 