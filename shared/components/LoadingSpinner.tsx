import { Loader2 } from 'lucide-react';
import { cn } from '../utils/tailwind-cn';

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={cn('text-muted-foreground h-6 w-6 animate-spin', className)} />
    </div>
  );
};

export default LoadingSpinner;
