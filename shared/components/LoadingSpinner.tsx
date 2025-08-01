import { Loader2 } from 'lucide-react';
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
