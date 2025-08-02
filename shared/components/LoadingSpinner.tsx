import { Loader2 } from 'lucide-react';
import React from 'react';
import { cn } from '../utils/tailwind-cn';

const LoadingSpinner = ({ className }: { className?: string }) => {
  return <Loader2 className={cn('text-muted-foreground h-6 w-6 animate-spin', className)} />;
};

export default LoadingSpinner;
