interface TagBadgeProps {
  tag: string;
  variant?: 'default' | 'category' | 'industry' | 'stage';
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  category: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  industry: 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
  stage: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export default function TagBadge({ tag, variant = 'default', onClick }: TagBadgeProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
    >
      {tag}
    </Component>
  );
}
