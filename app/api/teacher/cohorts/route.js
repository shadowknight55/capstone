import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const url = req?.url ? new URL(req.url) : null;
  const includeStudents = url?.searchParams.get('includeStudents');
  const cohorts = await prisma.cohort.findMany({
    include: includeStudents ? { students: true } : undefined
  });
  return NextResponse.json({ cohorts });
}

export async function POST(req) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  await prisma.cohort.create({ data: { name } });
  const cohorts = await prisma.cohort.findMany();
  return NextResponse.json({ cohorts });
} 