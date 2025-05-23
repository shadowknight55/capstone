'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [newCohort, setNewCohort] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const fetchData = () => {
    fetch('/api/teacher/students')
      .then(res => res.json())
      .then(data => setStudents(data.students || []));
    fetch('/api/teacher/cohorts')
      .then(res => res.json())
      .then(data => setCohorts(data.cohorts || []));
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
    const res = await fetch('/api/teacher/cohorts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCohort }),
    });
    if (res.ok) {
      setNewCohort('');
      fetchData();
    }
  };

  const handleAddStudentToCohort = async (e) => {
    e.preventDefault();
    if (!selectedCohort || !selectedStudent) return;
    const res = await fetch('/api/teacher/cohorts/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: selectedCohort, studentId: selectedStudent }),
    });
    if (res.ok) {
      setSelectedStudent('');
      fetchData();
    }
  };

  const handleDeleteCohort = async (cohortId) => {
    if (!window.confirm('Are you sure you want to delete this cohort?')) return;
    const res = await fetch(`/api/teacher/cohorts/${cohortId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleRemoveStudentFromCohort = async (cohortId, studentId) => {
    const res = await fetch('/api/teacher/cohorts/remove-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId, studentId }),
    });
    if (res.ok) fetchData();
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Teacher Dashboard</h1>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Students</h2>
        <ul className="mb-8 divide-y divide-gray-200">
          {students.map(s => (
            <li key={s._id} className="py-2 text-gray-700 flex items-center justify-between">
              <span>{s.name} <span className="text-gray-500 text-sm">({s.email})</span></span>
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-800">Cohorts</h2>
        <ul className="mb-6 divide-y divide-gray-200">
          {cohorts.map(c => (
            <li key={c._id} className="py-2 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{c.name}</span>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">{(c.students || []).length} students</span>
                </span>
                <button
                  onClick={() => handleDeleteCohort(c._id)}
                  className="ml-4 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
              {c.students && c.students.length > 0 && (
                <ul className="ml-4 mt-2 flex flex-wrap gap-2">
                  {c.students.map(stuId => {
                    const stu = students.find(s => s._id === (stuId._id || stuId.toString() || stuId));
                    return stu ? (
                      <li key={stu._id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">
                        {stu.name}
                        <button
                          onClick={() => handleRemoveStudentFromCohort(c._id, stu._id)}
                          className="ml-1 text-xs text-red-600 hover:underline"
                          title="Remove from cohort"
                        >
                          ✕
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
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
          <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition">Create Cohort</button>
        </form>
        <form onSubmit={handleAddStudentToCohort} className="flex gap-2 items-center">
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
          <button type="submit" className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 transition">Add Student to Cohort</button>
        </form>
      </div>
    </div>
  );
} 