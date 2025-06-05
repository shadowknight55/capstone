import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  const { cohortId } = await req.json();
  if (!cohortId) return NextResponse.json({ error: 'Missing cohortId' }, { status: 400 });
  await prisma.cohort.delete({ where: { id: Number(cohortId) } });
  return NextResponse.json({ ok: true });
} 