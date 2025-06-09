/**
 * @file Student Dashboard Page Component
 * @description Main dashboard for students to view their cohorts, work, and access Polypad.
 * Includes an AI assistant for Polypad help.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AIChatbot from '../components/AIChatbot';
import Image from 'next/image';

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-teal-50">
      <svg className="animate-spin h-12 w-12 text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <div className="text-teal-700 text-xl font-semibold">{message}</div>
    </div>
  );
}

/**
 * StudentHome Component
 * @component
 * @description Main dashboard component for students.
 * 
 * Features:
 * - Cohort management
 * - Work history
 * - Polypad access
 * - AI assistant integration
 * 
 * State Management:
 * - session: User session data
 * - cohorts: List of student's cohorts
 * - studentWork: List of student's saved work
 * - loading: Loading state for async operations
 * - showWorkModal: Modal visibility state
 * - selectedWork: Currently selected work for modal
 * - showDeleteConfirm: Delete confirmation modal state
 * - workToDelete: Work to be deleted
 * 
 * @returns {JSX.Element} The student dashboard component
 */
export default function StudentHome() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cohorts, setCohorts] = useState([]);
  const [studentWork, setStudentWork] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workToDelete, setWorkToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // Fetch cohorts
      const cohortsRes = await fetch(`/api/student/cohorts?studentId=${session.user.id}`);
      const cohortsData = await cohortsRes.json();
      setCohorts(cohortsData.cohorts || []);

      // Fetch student work
      const workRes = await fetch(`/api/student/work?studentId=${session.user.id}`);
      const workData = await workRes.json();
      setStudentWork(workData.work || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/');
      return;
    }
    if (session.user?.role !== 'student') {
      router.replace('/');
      return;
    }

    fetchData();
  }, [session, status, router, fetchData]);

  const handleDeleteWork = async (workId) => {
    if (!workId || !session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/student/work?workId=${workId}&studentId=${session.user.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete work');
      }
      
      // Update the work list
      setStudentWork(prevWork => prevWork.filter(work => work.id !== workId));
      setShowDeleteConfirm(false);
      setWorkToDelete(null);
    } catch (error) {
      console.error('Error deleting work:', error);
      alert('Error deleting work. Please try again.');
    }
    setLoading(false);
  };

  if (status === 'loading' || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-teal-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-teal-700">Welcome, {session.user.name}</h1>
              <p className="text-gray-600 mt-1">Student Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/student/polypad"
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Open Polypad
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cohorts Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Cohorts</h2>
            {cohorts.length === 0 ? (
              <p className="text-gray-500">You are not in any cohorts yet.</p>
            ) : (
              <ul className="space-y-3">
                {cohorts.map(cohort => (
                  <li key={cohort.id} className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                    <span className="font-medium text-teal-800">{cohort.name}</span>
                    {cohort.description && (
                      <p className="text-gray-600 text-sm mt-1">{cohort.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Work Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Work</h2>
            {studentWork.length === 0 ? (
              <p className="text-gray-500">No saved work yet. Try creating something in the Polypad!</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {studentWork.slice(0, 3).map(work => (
                  <div
                    key={work.id}
                    className="border rounded-lg overflow-hidden bg-teal-50 hover:bg-teal-100 transition"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-grow cursor-pointer"
                          onClick={() => { setSelectedWork(work); setShowWorkModal(true); }}
                        >
                          <h3 className="font-semibold text-gray-800">{work.title}</h3>
                          {work.description && (
                            <p className="text-gray-600 text-sm mt-1">{work.description}</p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-gray-500 text-xs">
                              {new Date(work.createdAt).toLocaleDateString()}
                            </p>
                            {work.cohortId && (
                              <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                                {cohorts.find(c => c.id === work.cohortId)?.name || 'Cohort'}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWorkToDelete(work);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete work"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {studentWork.length > 3 && (
                  <Link 
                    href="/student/work"
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium text-center block mt-2"
                  >
                    View all work →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && workToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Work</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete &quot;{workToDelete.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setWorkToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWork(workToDelete.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Screenshot Modal */}
      {showWorkModal && selectedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setShowWorkModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-2">{selectedWork.title}</h2>
            {selectedWork.description && (
              <p className="mb-2 text-gray-700">{selectedWork.description}</p>
            )}
            <Image
              src={selectedWork.screenshot}
              alt={selectedWork.title}
              width={500}
              height={400}
              className="w-full rounded border mb-2"
              style={{ objectFit: 'contain' }}
            />
            <div className="text-xs text-gray-500">
              Saved on {new Date(selectedWork.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Add AI Chatbot */}
      <AIChatbot />
    </div>
  );
} 