import Link from 'next/link';
import { ArrowRight, Lightbulb, Users, Zap } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Lightbulb,
      title: 'Share Challenges',
      description: 'Post your business problems and get solutions from experienced entrepreneurs.',
    },
    {
      icon: Users,
      title: 'Community Solutions',
      description: 'Crowdsource answers from a diverse community of founders and experts.',
    },
    {
      icon: Zap,
      title: 'AI-Powered Insights',
      description: 'Get AI-assisted categorization, similar issue detection, and solution drafts.',
    },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-gray-100">
              Crack any{' '}
              <span className="text-brand-600 dark:text-brand-400">business problem</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400">
              Craq is where entrepreneurs share real challenges and get actionable solutions
              from experienced problem solvers. Powered by community wisdom and AI.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/issues" className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
                Browse Issues
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/auth/register" className="btn-secondary text-lg px-8 py-3">
                Join the Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              How Craq Works
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Get your business problems solved in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 mb-4">
                  <feature.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">1K+</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Issues Solved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">5K+</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Solutions Posted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">2K+</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400">50+</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">Industries</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Ready to crack your next challenge?
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Join thousands of entrepreneurs solving problems together.
          </p>
          <Link href="/auth/register" className="mt-8 btn-primary text-lg px-8 py-3 inline-block">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
