import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 transition-colors duration-300">
      <div className="text-center px-6 py-20 flex flex-col items-center gap-4">
        <span className="text-6xl font-mono tracking-widest text-neutral-200 dark:text-neutral-800">404</span>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Page Temporarily Offline</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs max-w-sm leading-relaxed">
          This section is currently undergoing database updates or protocol migration. Please check back later.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-black dark:bg-white px-6 py-2.5 text-xs font-bold text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
