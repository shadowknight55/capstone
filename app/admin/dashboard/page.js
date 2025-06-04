'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50">
      <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <div className="text-purple-700 text-xl font-semibold">{message}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/');
      return;
    }
    if (session.user?.role !== 'admin') {
      router.replace('/');
      return;
    }
    fetchPendingTeachers();
  }, [session, status, router]);

  const fetchPendingTeachers = async () => {
    try {
      const response = await fetch('/api/admin/approve-teacher');
      if (!response.ok) throw new Error('Failed to fetch pending teachers');
      const data = await response.json();
      setPendingTeachers(data.pendingTeachers || []);
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
      setMessage('Error loading pending teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherAction = async (teacherEmail, action) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/approve-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherEmail, action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} teacher`);
      
      setMessage(`Teacher ${action}d successfully`);
      await fetchPendingTeachers();
    } catch (error) {
      console.error(`Error ${action}ing teacher:`, error);
      setMessage(`Error ${action}ing teacher`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 mb-2">LearnPad</h1>
            <h2 className="text-xl text-purple-600">Admin Dashboard</h2>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Sign Out
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-purple-100 text-purple-700 rounded-lg">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Teacher Approval Requests</h2>
          
          {pendingTeachers.length === 0 ? (
            <p className="text-gray-600">No pending teacher approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                    <p className="text-gray-600">{teacher.email}</p>
                    <p className="text-sm text-gray-500">
                      Registered: {new Date(teacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleTeacherAction(teacher.email, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleTeacherAction(teacher.email, 'reject')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 