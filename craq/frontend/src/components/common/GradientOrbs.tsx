'use client';

interface OrbProps {
  color?: 'brand' | 'accent' | 'mixed';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  delay?: boolean;
}

interface GradientOrbsProps {
  orbs?: OrbProps[];
  className?: string;
}

const defaultOrbs: OrbProps[] = [
  { color: 'brand', size: 'lg', position: 'top-right', delay: false },
  { color: 'accent', size: 'md', position: 'bottom-left', delay: true },
  { color: 'mixed', size: 'sm', position: 'top-left', delay: false },
];

const sizeClasses = {
  sm: 'w-32 h-32 sm:w-48 sm:h-48',
  md: 'w-48 h-48 sm:w-72 sm:h-72',
  lg: 'w-64 h-64 sm:w-96 sm:h-96',
};

const positionClasses = {
  'top-left': 'top-0 left-0 -translate-x-1/4 -translate-y-1/4',
  'top-right': 'top-0 right-0 translate-x-1/4 -translate-y-1/4',
  'bottom-left': 'bottom-0 left-0 -translate-x-1/4 translate-y-1/4',
  'bottom-right': 'bottom-0 right-0 translate-x-1/4 translate-y-1/4',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const colorClasses = {
  brand: 'bg-gradient-to-br from-brand-400/20 to-brand-600/20 dark:from-brand-400/10 dark:to-brand-600/10',
  accent: 'bg-gradient-to-br from-accent-400/20 to-accent-600/20 dark:from-accent-400/10 dark:to-accent-600/10',
  mixed: 'bg-gradient-to-br from-brand-400/15 to-accent-400/15 dark:from-brand-400/8 dark:to-accent-400/8',
};

export default function GradientOrbs({ orbs = defaultOrbs, className = '' }: GradientOrbsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={`absolute rounded-full blur-3xl ${sizeClasses[orb.size || 'md']} ${positionClasses[orb.position || 'center']} ${colorClasses[orb.color || 'brand']} ${orb.delay ? 'animate-float-delayed' : 'animate-float'}`}
        />
      ))}
    </div>
  );
}
