import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold text-gradient">
              Craq
            </span>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Crack any business problem. A community for entrepreneurs and problem solvers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Platform
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/issues" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300 relative group">
                  Browse Issues
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-500 dark:bg-brand-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300 relative group">
                  Tools Directory
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-500 dark:bg-brand-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300 relative group">
                  Search
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-500 dark:bg-brand-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Community
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/issues/new" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300 relative group">
                  Post an Issue
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-500 dark:bg-brand-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300 relative group">
                  Join Craq
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-brand-500 dark:bg-brand-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400">Privacy Policy</span>
              </li>
              <li>
                <span className="text-sm text-gray-600 dark:text-gray-400">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Craq. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
