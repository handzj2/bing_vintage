// src/app/(auth)/register/page.tsx
"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Register
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          User registration is currently managed by admin only.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Back to Login
        </Link>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-600">
          Contact your administrator to create an account.
        </p>
      </div>
    </div>
  );
}