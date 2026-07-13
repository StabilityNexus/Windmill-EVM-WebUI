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
        'relative z-[60] mx-auto hidden w-full flex-row items-center justify-between rounded-full px-6 py-2.5 lg:flex',
        visible 
          ? 'w-[70%] max-w-4xl bg-white/85 backdrop-blur-xl border border-black/5 shadow-md translate-y-4' 
          : 'w-full max-w-5xl bg-transparent border border-transparent translate-y-0',
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
        'absolute inset-0 hidden flex-row items-center justify-center space-x-1 text-xs font-semibold text-neutral-700 transition duration-200 lg:flex pointer-events-none',
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-neutral-700 hover:text-black transition-colors duration-200 pointer-events-auto"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <div className="absolute inset-0 h-full w-full rounded-full bg-neutral-100/70 z-0 animate-fade-in" />
          )}
          <span className="relative z-10 uppercase tracking-wider text-[10px] font-bold">{item.name}</span>
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
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-4 py-3.5 lg:hidden rounded-full',
        visible 
          ? 'w-[85%] bg-white/85 backdrop-blur-xl border border-black/5 shadow-md translate-y-4' 
          : 'w-full bg-transparent border border-transparent translate-y-0',
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
        'absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-3xl bg-white border border-black/5 p-6 shadow-xl animate-dropdown-enter',
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return (
    <button onClick={onClick} className="p-1 cursor-pointer">
      {isOpen ? (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )}
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <Link href="/" className="relative z-20 flex items-center space-x-2 px-2 py-1 text-sm font-bold text-black">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-xs">W</div>
      <span className="font-semibold text-black">WINDMILL</span>
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
    primary: 'bg-white text-black border border-black/5 shadow-sm hover:bg-neutral-50',
    secondary: 'bg-transparent text-neutral-600 hover:text-black border border-transparent',
    dark: 'bg-black text-white hover:bg-neutral-800 border border-transparent shadow-sm',
    gradient: 'bg-gradient-to-b from-neutral-800 to-black text-white shadow-sm border border-transparent',
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
