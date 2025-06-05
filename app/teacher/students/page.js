'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TeacherStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/');
      return;
    }
    if (session.user?.role !== 'teacher') {
      router.replace('/');
      return;
    }
    fetchStudents();
  }, [session, status, router]);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await fetch('/api/teacher/students');
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push('/teacher/dashboard')} className="px-4 py-2 bg-gray-200 text-green-700 rounded-lg hover:bg-gray-300 transition">Back to Dashboard</button>
          <h1 className="text-2xl font-bold text-green-700">All Students</h1>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Sign Out</button>
        </div>
        <ul className="divide-y divide-gray-200">
          {students.map(student => (
            <li key={student.id} className="py-2 flex items-center justify-between">
              <span>{student.name} <span className="text-xs text-gray-500">({student.email})</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 