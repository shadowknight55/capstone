'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-md">
        {children}
        <button className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function LoadingOverlay({ message = "Processing..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <svg className="animate-spin h-10 w-10 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <div className="text-green-700 text-lg font-semibold">{message}</div>
      </div>
    </div>
  );
}

export default function TeacherCohortsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [newCohort, setNewCohort] = useState('');
  const [selectedCohort, setSelectedCohort] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [showDeleteCohortModal, setShowDeleteCohortModal] = useState(false);
  const [cohortToDelete, setCohortToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentMap, setStudentMap] = useState({});
  const [quickAddCohort, setQuickAddCohort] = useState('');
  const [quickAddStudent, setQuickAddStudent] = useState('');
  const [quickAddMessage, setQuickAddMessage] = useState('');
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const studentsRes = await fetch('/api/teacher/students');
    const studentsData = await studentsRes.json();
    setStudents(studentsData.students || []);
    const map = {};
    (studentsData.students || []).forEach(s => { map[s.id] = s; });
    setStudentMap(map);
    const cohortsRes = await fetch('/api/teacher/cohorts?includeStudents=1');
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

  const handleRemoveCohort = async () => {
    setLoading(true);
    await fetch('/api/teacher/cohorts/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: cohortToDelete }),
    });
    setShowDeleteCohortModal(false);
    setCohortToDelete(null);
    setSelectedCohort(null);
    await fetchData();
  };

  const handleAddStudentToCohort = async () => {
    if (!selectedCohort || !selectedStudent) return;
    setLoading(true);
    await fetch('/api/teacher/cohorts/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: selectedCohort._id, studentId: selectedStudent }),
    });
    setShowAddStudentModal(false);
    setSelectedStudent('');
    await fetchData();
  };

  const handleRemoveStudentFromCohort = async () => {
    setLoading(true);
    await fetch('/api/teacher/cohorts/remove-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: selectedCohort._id, studentId: studentToRemove }),
    });
    setShowRemoveStudentModal(false);
    setStudentToRemove(null);
    await fetchData();
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickAddCohort || !quickAddStudent) return;
    setQuickAddLoading(true);
    setQuickAddMessage('');
    const res = await fetch('/api/teacher/cohorts/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: quickAddCohort, studentId: quickAddStudent }),
    });
    if (res.ok) {
      setQuickAddMessage('Student added to cohort!');
      setQuickAddCohort('');
      setQuickAddStudent('');
      await fetchData();
    } else {
      setQuickAddMessage('Failed to add student.');
    }
    setQuickAddLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      {(loading || quickAddLoading) && <LoadingOverlay message="Processing..." />}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push('/teacher/dashboard')} className="px-4 py-2 bg-gray-200 text-green-700 rounded-lg hover:bg-gray-300 transition">Back to Dashboard</button>
          <h1 className="text-2xl font-bold text-green-700">Manage Cohorts</h1>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Sign Out</button>
        </div>
        {/* Quick Add Student to Cohort */}
        <form onSubmit={handleQuickAdd} className="w-full bg-green-50 rounded-xl p-6 shadow mb-6">
          <h2 className="text-xl font-bold text-green-700 mb-4 text-center">Add Student to Cohort</h2>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <select
              value={quickAddCohort}
              onChange={e => setQuickAddCohort(e.target.value)}
              className="flex-1 px-3 py-2 border rounded bg-white text-gray-900"
              required
            >
              <option value="">Select Cohort</option>
              {cohorts.map(cohort => (
                <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
              ))}
            </select>
            <select
              value={quickAddStudent}
              onChange={e => setQuickAddStudent(e.target.value)}
              className="flex-1 px-3 py-2 border rounded bg-white text-gray-900"
              required
            >
              <option value="">Select Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-semibold" disabled={quickAddLoading}>
            {quickAddLoading ? 'Adding...' : 'Add Student'}
          </button>
          {quickAddMessage && <div className="mt-3 text-center text-green-700 font-semibold">{quickAddMessage}</div>}
        </form>
        <form onSubmit={handleCreateCohort} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCohort}
            onChange={e => setNewCohort(e.target.value)}
            placeholder="New Cohort Name"
            className="flex-1 px-3 py-2 border rounded bg-white text-gray-900"
            required
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create</button>
        </form>
        <ul className="divide-y divide-gray-200">
          {cohorts.map(cohort => (
            <li key={cohort.id}>
              <button
                type="button"
                className={`w-full flex items-center justify-between py-2 px-2 text-left font-medium text-lg rounded transition ${selectedCohort && selectedCohort.id === cohort.id ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-gray-900'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedCohort(cohort)}
              >
                <span>{cohort.name}</span>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </button>
              <button
                className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={() => { setShowDeleteCohortModal(true); setCohortToDelete(cohort.id); }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {selectedCohort && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Cohort: {selectedCohort.name}</h2>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => setShowAddStudentModal(true)}
              >
                Add Student
              </button>
            </div>
            <ul className="divide-y divide-gray-200">
              {(selectedCohort?.students || []).length === 0 && (
                <li className="py-2 text-gray-500">No students in this cohort.</li>
              )}
              {(selectedCohort?.students || []).map(student => (
                <li key={student.id} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-lg text-gray-900">{student.name} <span className="text-base text-blue-700 font-normal">({student.email})</span></span>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    onClick={() => { setShowRemoveStudentModal(true); setStudentToRemove(student.id); }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Modal open={showAddStudentModal} onClose={() => setShowAddStudentModal(false)}>
          <h3 className="text-lg font-semibold mb-2">Add Student to Cohort</h3>
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4 bg-white text-gray-900"
          >
            <option value="">Select a student</option>
            {students.filter(s => !(selectedCohort?.students || []).includes(s.id)).map(student => (
              <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
            onClick={handleAddStudentToCohort}
            disabled={!selectedStudent}
          >
            Add
          </button>
        </Modal>
        <Modal open={showRemoveStudentModal} onClose={() => setShowRemoveStudentModal(false)}>
          <h3 className="text-lg font-semibold mb-2">Remove Student from Cohort?</h3>
          <p>Are you sure you want to remove this student?</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
            onClick={handleRemoveStudentFromCohort}
          >
            Remove
          </button>
        </Modal>
        <Modal open={showDeleteCohortModal} onClose={() => setShowDeleteCohortModal(false)}>
          <h3 className="text-lg font-semibold mb-2">Delete Cohort?</h3>
          <p>Are you sure you want to delete this cohort? This cannot be undone.</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
            onClick={handleRemoveCohort}
          >
            Delete
          </button>
        </Modal>
      </div>
    </div>
  );
} 