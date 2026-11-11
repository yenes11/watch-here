import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export const STATUS_ACTION_CLASS =
  'inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-colors';

interface StatusScreenProps {
  icon: LucideIcon;
  title: string;
  message: string;
  /** Defaults to a link home; pass a node (e.g. a retry button) to replace it. */
  action?: React.ReactNode;
}

/** Full-page message for not-found and error states. */
export function StatusScreen({
  icon: Icon,
  title,
  message,
  action = (
    <Link href="/" className={STATUS_ACTION_CLASS}>
      Go Back Home
    </Link>
  ),
}: StatusScreenProps) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-4">
        <Icon aria-hidden className="size-24 text-zinc-600 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        <p className="text-zinc-400 text-lg mb-8">{message}</p>
        {action}
      </div>
    </main>
  );
}
