'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const POLYPAD_API_KEY = 'QDgLiYpFOg9QfBR435gysA';

export default function TeacherPolypad() {
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
    if (session.user?.role !== 'teacher') {
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
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1 className="text-2xl font-bold mb-4 text-green-700">Polypad for Teachers</h1>
      <div
        id="polypad"
        ref={polypadRef}
        style={{ width: 800, height: 500, background: 'white', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}
      />
    </div>
  );
} 