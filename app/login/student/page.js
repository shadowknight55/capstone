/**
 * @file Student Login Page Component
 * @description Handles student authentication including both traditional email/password login
 * and Google OAuth sign-in. Provides functionality for both new user registration and
 * existing user login.
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * LoadingScreen Component
 * @component
 * @description Displays a loading spinner with a customizable message while authentication
 * operations are in progress.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.message="Loading..."] - The message to display below the spinner
 * @returns {JSX.Element} A loading screen component with spinner and message
 */
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
 * StudentLogin Component
 * @component
 * @description Main student authentication component that handles both login and registration.
 * Provides a form for email/password authentication and Google OAuth sign-in option.
 * 
 * Features:
 * - Toggle between login and registration modes
 * - Email/password authentication
 * - Google OAuth integration
 * - Form validation
 * - Loading states
 * - Responsive design
 * 
 * State Management:
 * - email: User's email address
 * - password: User's password
 * - name: User's full name (for registration)
 * - isLogin: Toggle between login/register modes
 * - loading: Loading state for async operations
 * 
 * @returns {JSX.Element} A form component for student authentication
 */
export default function StudentLogin() {
  const [loading, setLoading] = useState(false);

  /**
   * Initiates Google OAuth sign-in process
   * Stores the pending role in localStorage for post-authentication handling
   */
  const handleGoogleSignIn = () => {
    setLoading(true);
    document.cookie = `pendingRole=student; path=/; max-age=60`; // Set cookie for 1 minute
    signIn('google', { callbackUrl: '/student/polypad' });
  };

  if (loading) return <LoadingScreen message="Processing..." />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700 mb-2">LearnPad</h1>
          <h2 className="text-2xl font-bold text-teal-700">Student Portal</h2>
        </div>
        <div className="space-y-6">
          <p className="text-center text-gray-600">
            Please sign in with your school-provided Google account to continue.
          </p>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-100 transition"
          style={{ minHeight: 44 }}
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={24}
            height={24}
            className="inline-block"
            style={{ minWidth: 24 }}
          />
          <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
} 