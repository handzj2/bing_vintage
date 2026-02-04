// src/app/loading.tsx  (or src/app/(dashboard)/loading.tsx etc.)
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}