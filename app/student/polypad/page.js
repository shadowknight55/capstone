'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    // Only load the script once
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

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-teal-50">
      <h1 className="text-2xl font-bold mb-4 text-teal-700">Polypad for Students</h1>
      <div
        id="polypad"
        ref={polypadRef}
        style={{ width: 800, height: 500, background: 'white', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}
      />
    </div>
  );
} 