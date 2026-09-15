import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'gold' | 'silver' | 'bronze' | 'platinum';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const variantClasses = {
    default: 'bg-[var(--color-bg-light)] text-[var(--color-text-primary)]',
    primary: 'bg-[var(--color-primary)] text-white',
    success: 'bg-[var(--color-success)] text-white',
    error: 'bg-[var(--color-error)] text-white',
    warning: 'bg-[var(--color-warning)] text-white',
    gold: 'bg-yellow-400 text-yellow-900',
    silver: 'bg-gray-300 text-gray-800',
    bronze: 'bg-orange-300 text-orange-900',
    platinum: 'bg-slate-200 text-slate-800 border border-slate-300',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};
