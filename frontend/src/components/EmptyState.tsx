
import React from 'react';
import { Info } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = <Info size={40} /> 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/25 text-center">
      <div className="rounded-full bg-muted p-6 text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
};

export default EmptyState;
