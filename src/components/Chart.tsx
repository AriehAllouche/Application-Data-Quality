import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';

interface ChartProps {
  title: string;
  children: React.ReactNode;
}

export default function Chart({ title, children }: ChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`relative ${isExpanded ? 'fixed inset-0 z-50 bg-white p-8' : 'h-full'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
      <div className={`${isExpanded ? 'h-[80vh]' : 'h-64'}`}>
        {children}
      </div>
    </div>
  );
}


