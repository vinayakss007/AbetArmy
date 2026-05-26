import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
              Craq
            </span>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Crack any business problem. A community for entrepreneurs and problem solvers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Platform
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/issues" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Browse Issues
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Tools Directory
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Community
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/issues/new" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Post an Issue
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">
                  Join Craq
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Craq. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
