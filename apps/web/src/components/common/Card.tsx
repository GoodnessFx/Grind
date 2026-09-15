import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<{ children: React.ReactNode; className?: string }>;
  Image: React.FC<{ src: string; alt: string; className?: string }>;
  Body: React.FC<{ children: React.ReactNode; className?: string }>;
  Footer: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-[var(--color-border)] flex justify-between items-center ${className}`}>
    {children}
  </div>
);

Card.Image = ({ src, alt, className = '' }) => (
  <img src={src} alt={alt} className={`w-full h-48 object-cover ${className}`} />
);

Card.Body = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg-light)] ${className}`}>
    {children}
  </div>
);
