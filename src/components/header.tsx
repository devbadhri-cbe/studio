'use client';
import Link from 'next/link';
import { Logo } from './logo';
import { SidebarTrigger } from './ui/sidebar';

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-card/80 backdrop-blur-sm no-print md:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold font-headline">Glycemic Guardian</span>
        </Link>
        <SidebarTrigger />
      </div>
    </header>
  );
}
