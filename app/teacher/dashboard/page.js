'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <svg className="animate-spin h-12 w-12 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <div className="text-green-700 text-xl font-semibold">{message}</div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [newCohort, setNewCohort] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentMap, setStudentMap] = useState({});

  const fetchData = async () => {
    setLoading(true);
    const studentsRes = await fetch('/api/teacher/students');
    const studentsData = await studentsRes.json();
    setStudents(studentsData.students || []);
    const map = {};
    (studentsData.students || []).forEach(s => { map[s._id] = s; });
    setStudentMap(map);
    const cohortsRes = await fetch('/api/teacher/cohorts');
    const cohortsData = await cohortsRes.json();
    setCohorts(cohortsData.cohorts || []);
    setLoading(false);
  };

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
    fetchData();
  }, [session, status, router]);

  const handleCreateCohort = async (e) => {
    e.preventDefault();
    if (!newCohort) return;
    setLoading(true);
    await fetch('/api/teacher/cohorts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCohort }),
    });
    setNewCohort('');
    await fetchData();
  };

  const handleAddStudentToCohort = async (e) => {
    e.preventDefault();
    if (!selectedCohort || !selectedStudent) return;
    setLoading(true);
    await fetch('/api/teacher/cohorts/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: selectedCohort, studentId: selectedStudent }),
    });
    setSelectedStudent('');
    await fetchData();
  };

  const handleRemoveCohort = async (cohortId) => {
    setLoading(true);
    await fetch('/api/teacher/cohorts/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId }),
    });
    await fetchData();
  };

  const handleRemoveStudentFromCohort = async (cohortId, studentId) => {
    setLoading(true);
    await fetch('/api/teacher/cohorts/remove-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId, studentId }),
    });
    await fetchData();
  };

  if (status === 'loading' || loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Teacher Dashboard</h1>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Students</h2>
        <ul className="mb-4">
          {students.map(s => (
            <li key={s._id} className="py-1 border-b last:border-b-0 text-gray-700 flex items-center justify-between">
              <span>{s.name} ({s.email})</span>
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Cohorts</h2>
        <ul className="mb-4 space-y-4">
          {cohorts.map(c => (
            <li key={c._id} className="py-2 border-b last:border-b-0 text-gray-700 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">{c.name} <span className="text-xs text-gray-500">({(c.students || []).length} students)</span></span>
                <button onClick={() => handleRemoveCohort(c._id)} className="ml-2 text-red-600 hover:text-red-800 text-sm">Delete Cohort</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(c.students || []).length === 0 && <span className="text-gray-400 text-sm">No students in this cohort.</span>}
                {(c.students || []).map(stuId => (
                  <span key={stuId} className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {studentMap[stuId]?.name || 'Unknown'}
                    <button onClick={() => handleRemoveStudentFromCohort(c._id, stuId)} className="ml-1 text-red-500 hover:text-red-700" title="Remove">×</button>
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={handleCreateCohort} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCohort}
            onChange={e => setNewCohort(e.target.value)}
            placeholder="New Cohort Name"
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-gray-800"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Create Cohort</button>
        </form>
        <form onSubmit={handleAddStudentToCohort} className="flex gap-2">
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-gray-800"
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <select
            value={selectedCohort}
            onChange={e => setSelectedCohort(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-gray-800"
          >
            <option value="">Select Cohort</option>
            {cohorts.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-green-700 text-white px-4 py-1 rounded">Add Student to Cohort</button>
        </form>
      </div>
    </div>
  );
} 