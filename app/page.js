'use client';

/**
 * @file Home Page Component
 * @description The landing page for the School Portal application. Provides navigation options
 * for students and teachers to access their respective login pages.
 * 
 * This component serves as the main entry point for users, offering a clean and intuitive
 * interface with two distinct paths for student and teacher authentication.
 */

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

/**
 * Home Component
 * @component
 * @description Renders the main landing page with navigation buttons for student and teacher login.
 * 
 * Features:
 * - Responsive design with gradient background
 * - Clear visual hierarchy with prominent headings
 * - Interactive buttons with hover effects
 * - Separate paths for student and teacher authentication
 * 
 * @returns {JSX.Element} A React component that displays the landing page
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-white">
      <h1 className="text-4xl font-bold mb-12 text-teal-700">Welcome to School Portal</h1>
      <div className="flex flex-col gap-8 w-full max-w-xs">
        <a
          href="/login/student"
          className="w-full py-6 text-2xl font-semibold text-center rounded-lg shadow-lg bg-teal-500 text-white hover:bg-teal-600 transition"
        >
          Student Sign In
        </a>
        <a
          href="/login/teacher"
          className="w-full py-6 text-2xl font-semibold text-center rounded-lg shadow-lg bg-green-600 text-white hover:bg-green-700 transition"
        >
          Teacher Sign In
        </a>
        <a
          href="/login/admin"
          className="w-full py-6 text-2xl font-semibold text-center rounded-lg shadow-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Admin Sign In
        </a>
      </div>
    </div>
  );
}

