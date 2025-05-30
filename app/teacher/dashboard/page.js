/**
 * @file Teacher Dashboard Page Component
 * @description Main dashboard interface for teachers to manage students, cohorts, and view student work.
 * Provides functionality for cohort management, student assignment, and work review.
 * 
 * Features:
 * - Student management
 * - Cohort creation and management
 * - Student-cohort assignment
 * - Student work review
 * - Session management
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * LoadingScreen Component
 * @component
 * @description Displays a loading spinner with a customizable message while operations are in progress.
 * Uses green theme colors consistent with teacher interface.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - The message to display below the spinner
 * @returns {JSX.Element} A loading screen component with spinner and message
 */
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

/**
 * TeacherDashboard Component
 * @component
 * @description Main dashboard component for teachers to manage their classroom.
 * Handles student and cohort management, as well as viewing student work.
 * 
 * Features:
 * - Student list management
 * - Cohort creation and deletion
 * - Student-cohort assignment
 * - Student work review by cohort
 * - Session-based authentication
 * 
 * State Management:
 * - session: User session data
 * - students: List of all students
 * - cohorts: List of all cohorts
 * - newCohort: New cohort name input
 * - selectedCohort: Currently selected cohort for student assignment
 * - selectedStudent: Currently selected student for cohort assignment
 * - loading: Loading state for async operations
 * - studentMap: Map of student IDs to student objects
 * - selectedCohortForWork: Currently selected cohort for work review
 * - cohortWork: Work data for selected cohort
 * - loadingWork: Loading state for work fetching
 * 
 * @returns {JSX.Element} The teacher dashboard component
 */
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
  const [selectedCohortForWork, setSelectedCohortForWork] = useState('');
  const [cohortWork, setCohortWork] = useState(null);
  const [loadingWork, setLoadingWork] = useState(false);

  /**
   * Fetches initial data for students and cohorts
   * @async
   * @returns {Promise<void>}
   * 
   * Fetches:
   * - List of all students
   * - List of all cohorts
   * Creates a map of student IDs to student objects for quick lookup
   */
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

  /**
   * Effect hook for authentication and data initialization
   * - Checks user session and role
   * - Fetches initial data if authenticated
   */
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

  /**
   * Creates a new cohort
   * @async
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   */
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

  /**
   * Adds a student to a cohort
   * @async
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   */
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

  /**
   * Removes a cohort
   * @async
   * @param {string} cohortId - ID of the cohort to remove
   * @returns {Promise<void>}
   */
  const handleRemoveCohort = async (cohortId) => {
    setLoading(true);
    await fetch('/api/teacher/cohorts/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId }),
    });
    await fetchData();
  };

  /**
   * Removes a student from a cohort
   * @async
   * @param {string} cohortId - ID of the cohort
   * @param {string} studentId - ID of the student to remove
   * @returns {Promise<void>}
   */
  const handleRemoveStudentFromCohort = async (cohortId, studentId) => {
    setLoading(true);
    await fetch('/api/teacher/cohorts/remove-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId, studentId }),
    });
    await fetchData();
  };

  /**
   * Fetches work submitted by students in a cohort
   * @async
   * @param {string} cohortId - ID of the cohort to fetch work for
   * @returns {Promise<void>}
   * 
   * @throws {Error} If fetching fails, shows error message to user
   */
  const fetchCohortWork = async (cohortId) => {
    if (!cohortId) {
      setCohortWork(null);
      return;
    }

    setLoadingWork(true);
    try {
      const response = await fetch(`/api/teacher/work?cohortId=${cohortId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cohort work');
      }
      const data = await response.json();
      setCohortWork(data);
    } catch (error) {
      console.error('Error fetching cohort work:', error);
      alert('Error fetching student work. Please try again.');
    } finally {
      setLoadingWork(false);
    }
  };

  /**
   * Effect hook for fetching cohort work
   * Triggers when selectedCohortForWork changes
   */
  useEffect(() => {
    if (selectedCohortForWork) {
      fetchCohortWork(selectedCohortForWork);
    }
  }, [selectedCohortForWork]);

  if (status === 'loading' || loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center py-10">
      <div className="w-full max-w-6xl px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Teacher Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
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
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-gray-800 placeholder-gray-400"
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
            <button type="submit" className="bg-green-700 text-white px-4 py-1 rounded">Add to Cohort</button>
          </form>
        </div>

        {/* Student Work Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Student Work</h2>
          <div className="mb-4">
            <select
              value={selectedCohortForWork}
              onChange={(e) => setSelectedCohortForWork(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800"
            >
              <option value="">Select a cohort to view work</option>
              {cohorts.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {loadingWork ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading student work...</p>
            </div>
          ) : cohortWork ? (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Work from {cohortWork.cohort.name}
              </h3>
              {cohortWork.work.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No work submitted yet for this cohort.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cohortWork.work.map((item) => (
                    <div key={item._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="aspect-video relative mb-3 bg-white rounded overflow-hidden">
                        <Image
                          src={item.screenshot}
                          alt={item.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.description || 'No description'}</p>
                      <div className="text-sm text-gray-500">
                        <p>By: {item.student.name}</p>
                        <p>Submitted: {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Select a cohort to view student work</p>
          )}
        </div>
      </div>
    </div>
  );
} 