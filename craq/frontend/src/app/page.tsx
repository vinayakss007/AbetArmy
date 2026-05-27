import Link from 'next/link';
import { ArrowRight, Lightbulb, Users, Zap } from 'lucide-react';
import GradientOrbs from '@/components/common/GradientOrbs';
import AnimatedCounter from '@/components/common/AnimatedCounter';

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

  const stats = [
    { value: 1000, suffix: '+', label: 'Issues Solved' },
    { value: 5000, suffix: '+', label: 'Solutions Posted' },
    { value: 2000, suffix: '+', label: 'Members' },
    { value: 50, suffix: '+', label: 'Industries' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-[80vh] flex items-center">
        <GradientOrbs
          orbs={[
            { color: 'brand', size: 'lg', position: 'top-right', delay: false },
            { color: 'accent', size: 'md', position: 'bottom-left', delay: true },
            { color: 'mixed', size: 'sm', position: 'top-left', delay: false },
          ]}
        />
        <div className="absolute inset-0 dot-grid-pattern opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Crack any{' '}
              <span className="text-gradient-animated">business problem</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Craq is where entrepreneurs share real challenges and get actionable solutions
              from experienced problem solvers. Powered by community wisdom and AI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/issues"
                className="btn-primary text-lg px-8 py-3.5 inline-flex items-center justify-center gap-2 group"
              >
                Browse Issues
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/auth/register"
                className="btn-secondary text-lg px-8 py-3.5 inline-flex items-center justify-center"
              >
                Join the Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              How Craq Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Get your business problems solved in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card p-8 text-center group hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-400/5 transition-all duration-300 hover:border-brand-200 dark:hover:border-brand-800"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/30 dark:to-accent-900/30 mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-brand-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
        <GradientOrbs
          orbs={[
            { color: 'brand', size: 'sm', position: 'top-left', delay: true },
            { color: 'accent', size: 'sm', position: 'bottom-right', delay: false },
          ]}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-gradient">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    duration={2000 + index * 200}
                  />
                </div>
                <div className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-pattern opacity-20" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Ready to crack your next challenge?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Join thousands of entrepreneurs solving problems together.
          </p>
          <Link
            href="/auth/register"
            className="mt-10 btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 group"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
