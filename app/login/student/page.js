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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Handles form submission for both login and registration
   * @async
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      setLoading(false);
      if (result?.ok) {
        window.location.href = '/student/polypad';
      }
    } else {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'student' }),
      });
      setLoading(false);
      if (res.ok) {
        setIsLogin(true);
      }
    }
  };

  /**
   * Initiates Google OAuth sign-in process
   * Stores the pending role in localStorage for post-authentication handling
   */
  const handleGoogleSignIn = () => {
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-gray-800 placeholder-gray-400"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-gray-800 placeholder-gray-400"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-gray-800 placeholder-gray-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            {isLogin ? 'Sign In to LearnPad' : 'Create LearnPad Account'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">Or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
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
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-teal-600 hover:text-teal-500"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
} 