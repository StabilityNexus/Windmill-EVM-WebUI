'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
    active?: boolean;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn('relative w-full transition-all duration-300', className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child
      )}
    </div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <div
      style={{
        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      className={cn(
        'relative z-[60] mx-auto hidden w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-5 rounded-full px-8 py-2 xl:grid',
        visible
          ? 'w-[92%] max-w-7xl glass-pill shadow-lg translate-y-4'
          : 'w-full max-w-7xl bg-transparent border-transparent translate-y-0',
        className
      )}
    >
      {children}
    </div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'hidden w-fit min-w-0 flex-none flex-row items-center justify-center gap-1 xl:gap-3 text-xs xl:text-sm font-semibold text-neutral-700 dark:text-neutral-300 transition duration-200 xl:flex',
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'relative min-w-max shrink-0 rounded-full px-1 py-1.5 transition-colors duration-200 xl:px-2 xl:py-2 select-none',
            item.active
              ? 'bg-neutral-100/80 text-black dark:bg-white/10 dark:text-white font-bold'
              : 'text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white'
          )}
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <div className="absolute inset-0 h-full w-full rounded-full bg-neutral-100/70 dark:bg-white/10 z-0 animate-fade-in pointer-events-none" />
          )}
          <span className="relative z-10 uppercase tracking-wider text-xs xl:text-sm font-bold whitespace-nowrap">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <div
      style={{
        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      className={cn(
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-6 py-3 xl:hidden rounded-full',
        visible 
          ? 'w-[92%] glass-pill shadow-lg translate-y-4'
          : 'w-full bg-transparent border-transparent translate-y-0',
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return (
    <div className={cn('flex w-full flex-row items-center justify-between', className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-3xl bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 p-6 shadow-xl animate-dropdown-enter text-foreground',
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return (
    <button onClick={onClick} className="p-1 cursor-pointer text-black dark:text-white" aria-label="Toggle navigation menu">
      {isOpen ? (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )}
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <Link href="/" className="relative z-20 flex items-center space-x-2 px-2 py-1 text-sm font-bold text-black dark:text-white">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black text-xs">W</div>
      <span className="font-semibold text-black dark:text-white">WINDMILL</span>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = href ? 'a' : 'button',
  children,
  className,
  variant = 'primary',
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient';
} & (React.ComponentPropsWithoutRef<'a'> | React.ComponentPropsWithoutRef<'button'>)) => {
  const baseStyles =
    'px-4 py-2 rounded-full text-xs font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center select-none';

  const variantStyles = {
    primary: 'bg-white text-black border border-black/5 shadow-xs hover:bg-neutral-50 dark:bg-neutral-900 dark:text-white dark:border-white/10 dark:hover:bg-neutral-800',
    secondary: 'bg-transparent text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white border border-transparent',
    dark: 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border border-transparent shadow-xs',
    gradient: 'bg-gradient-to-b from-neutral-800 to-black text-white dark:from-neutral-100 dark:to-neutral-300 dark:text-black shadow-xs border border-transparent',
  };

  const TagElement = Tag as React.ComponentType<{
    href?: string;
    type?: string;
    className?: string;
    children?: React.ReactNode;
  }>;

  return (
    <TagElement
      href={Tag === 'a' ? href || undefined : undefined}
      type={Tag === 'button' ? 'button' : undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </TagElement>
  );
};
