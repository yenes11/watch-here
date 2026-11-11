'use client';

import { CloudOff } from 'lucide-react';
import { STATUS_ACTION_CLASS, StatusScreen } from '@/components/StatusScreen';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <StatusScreen
      icon={CloudOff}
      title="Something Went Wrong"
      message="We couldn’t load this page. Please try again in a moment."
      action={
        <button type="button" onClick={reset} className={STATUS_ACTION_CLASS}>
          Try Again
        </button>
      }
    />
  );
}
