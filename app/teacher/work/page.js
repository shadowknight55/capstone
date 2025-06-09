'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TeacherWorkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [cohortWork, setCohortWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingWork, setLoadingWork] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [modalImage, setModalImage] = useState(null);

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
    fetchCohorts();
  }, [session, status, router]);

  const fetchCohorts = async () => {
    setLoading(true);
    const res = await fetch('/api/teacher/cohorts');
    const data = await res.json();
    setCohorts(data.cohorts || []);
    setLoading(false);
  };

  const fetchCohortWork = async (cohortId) => {
    if (!cohortId) {
      setCohortWork(null);
      return;
    }
    setLoadingWork(true);
    try {
      const response = await fetch(`/api/teacher/work?cohortId=${cohortId}`);
      if (!response.ok) throw new Error('Failed to fetch cohort work');
      const data = await response.json();
      setCohortWork(data);
    } catch (error) {
      alert('Error fetching student work. Please try again.');
    } finally {
      setLoadingWork(false);
    }
  };

  useEffect(() => {
    if (selectedCohort) {
      fetchCohortWork(selectedCohort);
    }
  }, [selectedCohort]);

  // Group work by student
  const studentWorkMap = useMemo(() => {
    if (!cohortWork || !cohortWork.work) return {};
    const map = {};
    cohortWork.work.forEach(item => {
      const id = item.student?._id?.toString() || item.studentId?.toString() || 'unknown';
      if (!map[id]) map[id] = [];
      map[id].push(item);
    });
    return map;
  }, [cohortWork]);
  const studentList = useMemo(() => {
    if (!cohortWork || !cohortWork.work) return [];
    const seen = new Set();
    return cohortWork.work
      .map(item => ({
        id: item.student?._id?.toString() || item.studentId?.toString() || 'unknown',
        name: item.student?.name || 'Unknown Student',
        email: item.student?.email || 'Unknown',
      }))
      .filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
  }, [cohortWork]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push('/teacher/dashboard')} className="px-4 py-2 bg-gray-200 text-green-700 rounded-lg hover:bg-gray-300 transition">Back to Dashboard</button>
          <h1 className="text-2xl font-bold text-green-700">Student Submissions</h1>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Sign Out</button>
        </div>
        <select
          value={selectedCohort}
          onChange={e => setSelectedCohort(e.target.value)}
          className="mb-4 px-3 py-2 border rounded bg-white text-gray-900"
        >
          <option value="">Select a cohort</option>
          {cohorts.map(cohort => (
            <option key={cohort.id} value={cohort.id}>{cohort.name}</option>
          ))}
        </select>
        {loadingWork ? (
          <div>Loading work...</div>
        ) : cohortWork && cohortWork.work.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Student List */}
            <div className="md:w-1/4 w-full mb-4">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Students</h3>
              <ul>
                {studentList.map(student => (
                  <li key={student.id}>
                    <button
                      className={`w-full text-left px-2 py-2 rounded mb-1 font-medium transition ${selectedStudentId === student.id ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-gray-900'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      {student.name} <span className="text-xs text-blue-700">({student.email})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Work List */}
            <div className="md:w-3/4 w-full">
              {selectedStudentId ? (
                <ul className="divide-y divide-gray-200">
                  {(studentWorkMap[selectedStudentId] || []).map(item => (
                    <li key={item.id || item._id} className="py-4">
                      <div className="font-bold text-lg text-green-900 mb-1">{item.title || '[No Title]'}</div>
                      {item.description && (
                        <div className="text-green-700 mb-2">{item.description}</div>
                      )}
                      {item.screenshot && (
                        <img
                          src={item.screenshot}
                          alt={item.title || 'Student Work'}
                          className="w-full max-w-[180px] rounded border mb-2 cursor-pointer hover:shadow-lg transition"
                          style={{ maxHeight: 120, objectFit: 'contain' }}
                          onClick={() => setModalImage(item.screenshot)}
                        />
                      )}
                      {!item.title && !item.description && !item.screenshot && (
                        <div className="text-green-500">[No content]</div>
                      )}
                      <div className="text-xs text-green-400 mt-2">Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown'}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-green-700">Select a student to view their submissions.</div>
              )}
            </div>
          </div>
        ) : selectedCohort ? (
          <div className="text-green-700">No work submitted for this cohort yet.</div>
        ) : null}
      </div>
      {/* Screenshot Modal */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
          <div className="bg-white rounded-xl p-4 shadow-lg max-w-2xl w-full flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setModalImage(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <img src={modalImage} alt="Full Size Work" className="w-full max-w-xl rounded border" style={{ maxHeight: '70vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
} 