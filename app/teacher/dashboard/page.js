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
import { UserGroupIcon, UsersIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

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
  const [loading, setLoading] = useState(true);
  const [studentMap, setStudentMap] = useState({});
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [showDeleteCohortModal, setShowDeleteCohortModal] = useState(false);
  const [cohortToDelete, setCohortToDelete] = useState(null);
  const [selectedCohortForWork, setSelectedCohortForWork] = useState('');
  const [cohortWork, setCohortWork] = useState(null);
  const [loadingWork, setLoadingWork] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

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

  const fetchData = async () => {
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
   * Removes a cohort
   * @async
   * @param {string} cohortId - ID of the cohort to remove
   * @returns {Promise<void>}
   */
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

  /**
   * Adds a student to a cohort
   * @async
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   */
  const handleAddStudentToCohort = async (e) => {
    e.preventDefault();
    if (!selectedCohort || !selectedStudent) return;
    setAdding(true);
    setMessage('');
    const res = await fetch('/api/teacher/cohorts/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cohortId: selectedCohort, studentId: selectedStudent }),
    });
    if (res.ok) {
      setMessage('Student added to cohort!');
      setSelectedCohort('');
      setSelectedStudent('');
    } else {
      setMessage('Failed to add student.');
    }
    setAdding(false);
  };

  /**
   * Removes a student from a cohort
   * @async
   * @param {string} cohortId - ID of the cohort
   * @param {string} studentId - ID of the student to remove
   * @returns {Promise<void>}
   */
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

  if (status === 'loading' || loading) return <LoadingScreen message="Loading dashboard..." />;

  return (
    <div className="min-h-screen bg-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/conduit-logo.png"
              alt="Conduit Logo"
              width={150}
              height={30}
            />
            <div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">LearnPad</h1>
              <h2 className="text-xl text-green-600">Teacher Dashboard</h2>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >Sign Out</button>
        </div>
        <div className="space-y-6 w-full mb-8">
          <button className="w-full flex items-center gap-3 px-4 py-4 text-xl bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold justify-center" onClick={() => router.push('/teacher/students')}>
            <UsersIcon className="h-7 w-7" /> View Students
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-4 text-xl bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold justify-center" onClick={() => router.push('/teacher/cohorts')}>
            <UserGroupIcon className="h-7 w-7" /> Manage Cohorts
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-4 text-xl bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold justify-center" onClick={() => router.push('/teacher/work')}>
            <ClipboardDocumentListIcon className="h-7 w-7" /> Student Submissions
          </button>
        </div>
      </div>
    </div>
  );
} 