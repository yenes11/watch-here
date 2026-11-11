import { Film } from 'lucide-react';
import { StatusScreen } from '@/components/StatusScreen';

export default function MovieNotFound() {
  return (
    <StatusScreen
      icon={Film}
      title="Movie Not Found"
      message="The movie you’re looking for doesn’t exist or has been removed."
    />
  );
}
