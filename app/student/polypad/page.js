'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import html2canvas from 'html2canvas';

const POLYPAD_API_KEY = 'QDgLiYpFOg9QfBR435gysA';

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

export default function StudentPolypad() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const polypadRef = useRef(null);
  const [polypadLoaded, setPolypadLoaded] = useState(false);
  const [currentCohort, setCurrentCohort] = useState(null);
  const [savingWork, setSavingWork] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState('');

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

    // Fetch student's cohorts
    const fetchCohort = async () => {
      try {
        if (!session?.user?.id) {
          console.error('No user ID available');
          return;
        }

        const cohortsRes = await fetch(`/api/student/cohorts?studentId=${session.user.id}`);
        if (!cohortsRes.ok) {
          const errorText = await cohortsRes.text();
          console.error('Error response from cohorts API:', {
            status: cohortsRes.status,
            statusText: cohortsRes.statusText,
            body: errorText
          });
          return;
        }

        const cohortsData = await cohortsRes.json();
        if (!cohortsData || !Array.isArray(cohortsData.cohorts)) {
          console.error('Invalid response format from cohorts API:', cohortsData);
          return;
        }

        setCohorts(cohortsData.cohorts);
        if (cohortsData.cohorts.length > 0) {
          setCurrentCohort(cohortsData.cohorts[0]);
          setSelectedCohortId(cohortsData.cohorts[0]._id);
        }
      } catch (error) {
        console.error('Error fetching cohort:', error);
      }
    };

    fetchCohort();

    // Load polypad script
    if (!window.Polypad) {
      const script = document.createElement('script');
      script.src = `https://polypad.amplify.com/api/latest/polypad.js?lang=en&apiKey=${POLYPAD_API_KEY}`;
      script.async = true;
      script.onload = () => setPolypadLoaded(true);
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setPolypadLoaded(true);
    }
  }, [session, status, router]);

  useEffect(() => {
    if (polypadLoaded && window.Polypad && polypadRef.current) {
      polypadRef.current.innerHTML = '';
      window.Polypad.create(polypadRef.current);
    }
  }, [polypadLoaded]);

  const handleSaveWork = async () => {
    if (!workTitle || !polypadRef.current) return;
    
    setSavingWork(true);
    try {
      // Wait a moment for the polypad to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get screenshot of the entire polypad container
      const canvas = await html2canvas(polypadRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality screenshot
        logging: false,
        useCORS: true
      });
      
      const screenshot = canvas.toDataURL('image/png');

      // Save work to database
      await fetch('/api/student/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: session.user.id,
          title: workTitle,
          description: workDescription,
          screenshot,
          cohortId: selectedCohortId || null
        }),
      });

      // Reset form and close modal
      setWorkTitle('');
      setWorkDescription('');
      setShowSaveModal(false);
      
      // Show success message
      alert('Work saved successfully!');
    } catch (error) {
      console.error('Error saving work:', error);
      alert('Error saving work. Please try again.');
    }
    setSavingWork(false);
  };

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-teal-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/student"
              className="text-teal-600 hover:text-teal-700 flex items-center gap-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-teal-700">Polypad</h1>
            {currentCohort && (
              <span className="text-sm bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                {currentCohort.name}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSaveModal(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Save Work
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div
            id="polypad"
            ref={polypadRef}
            className="w-full"
            style={{ height: '600px' }}
          />
        </div>
      </div>

      {/* Save Work Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Save Your Work</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-gray-800 placeholder-gray-400"
                  placeholder="Enter a title for your work"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-gray-800 placeholder-gray-400"
                  rows="3"
                  placeholder="Describe your work"
                />
              </div>
              {cohorts.length > 1 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Cohort</label>
                  <select
                    value={selectedCohortId}
                    onChange={e => setSelectedCohortId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-gray-800"
                  >
                    {cohorts.map(cohort => (
                      <option key={cohort._id} value={cohort._id}>{cohort.name}</option>
                    ))}
                  </select>
                </div>
              ) : currentCohort ? (
                <div className="text-sm text-gray-600">
                  This work will be saved to your cohort: <span className="font-medium text-teal-700">{currentCohort.name}</span>
                </div>
              ) : null}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWork}
                  disabled={!workTitle || savingWork}
                  className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
                >
                  {savingWork ? 'Saving...' : 'Save Work'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 