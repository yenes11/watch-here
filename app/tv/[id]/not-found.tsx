import { Tv } from 'lucide-react';
import { StatusScreen } from '@/components/StatusScreen';

export default function TvShowNotFound() {
  return (
    <StatusScreen
      icon={Tv}
      title="TV Show Not Found"
      message="The TV show you’re looking for doesn’t exist or has been removed."
    />
  );
}
