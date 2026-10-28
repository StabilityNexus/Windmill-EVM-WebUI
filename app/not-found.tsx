import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground flex flex-col items-center justify-center pt-24 transition-colors duration-300">
      <div className="text-center px-6 py-20 flex flex-col items-center gap-4">
        <span className="text-6xl font-mono tracking-widest text-neutral-200 dark:text-neutral-800">404</span>
        <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">Page Not Found</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs max-w-sm leading-relaxed">
          The page you are looking for does not exist or has been moved. Please check the URL or return home.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-xs"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
