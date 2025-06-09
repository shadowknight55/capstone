/**
 * @file Teacher Login Page Component
 * @description Handles teacher authentication including both traditional email/password login
 * and Google OAuth sign-in. Provides functionality for both new teacher registration and
 * existing teacher login.
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
 * operations are in progress. Uses green theme colors to differentiate from student loading screen.
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
 * TeacherLogin Component
 * @component
 * @description Main teacher authentication component that handles both login and registration.
 * Provides a form for email/password authentication and Google OAuth sign-in option.
 * Uses a green color scheme to differentiate from student interface.
 * 
 * Features:
 * - Toggle between login and registration modes
 * - Email/password authentication
 * - Google OAuth integration
 * - Form validation
 * - Loading states
 * - Responsive design with green theme
 * 
 * State Management:
 * - email: Teacher's email address
 * - password: Teacher's password
 * - name: Teacher's full name (for registration)
 * - isLogin: Toggle between login/register modes
 * - loading: Loading state for async operations
 * 
 * @returns {JSX.Element} A form component for teacher authentication
 */
export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const checkTeacherStatus = async (email) => {
    try {
      const response = await fetch('/api/teacher/status');
      if (!response.ok) throw new Error('Failed to check status');
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error checking teacher status:', error);
      return 'unknown';
    }
  };

  /**
   * Handles form submission for both login and registration
   * @async
   * @param {Event} e - Form submission event
   * @returns {Promise<void>}
   * 
   * On successful login, redirects to teacher dashboard
   * On successful registration, switches to login mode
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (isLogin) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.ok) {
        const status = await checkTeacherStatus(email);
        if (status === 'pending') {
          setError('Your account is pending approval. Please wait for an admin to approve your account.');
          setLoading(false);
          return;
        } else if (status === 'rejected') {
          setError('Your account has been rejected. Please contact the administrator for more information.');
          setLoading(false);
          return;
        } else if (status === 'active') {
          window.location.href = '/teacher/dashboard';
        } else {
          setError('Unable to verify your account status. Please try again later.');
        }
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    } else {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'teacher' }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setError('');
        setIsLogin(true);
        // Show success message for registration
        setError('Registration successful! Please wait for admin approval before signing in.');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    }
  };

  if (loading) return <LoadingScreen message="Processing..." />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">LearnPad</h1>
          <h2 className="text-2xl font-bold text-green-700">Teacher Portal</h2>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800 placeholder-gray-400"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800 placeholder-gray-400"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800 placeholder-gray-400"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isLogin ? 'Sign In to LearnPad' : 'Create LearnPad Account'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-green-700 hover:text-green-500"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
} 