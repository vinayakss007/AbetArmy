import Link from 'next/link';
import { FileQuestion, Home, MessageSquare } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
          <FileQuestion className="h-10 w-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Page Not Found
        </h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/issues"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Browse Issues
          </Link>
        </div>
      </div>
    </div>
  );
}
