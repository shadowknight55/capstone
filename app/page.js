'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

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
      </div>
    </div>
  );
}
