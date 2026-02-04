// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Page Not Found
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}