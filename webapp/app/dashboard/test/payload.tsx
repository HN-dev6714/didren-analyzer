import React from 'react';

// Define what props this component expects to receive
interface MetricViewerProps {
  title: string;
  // This tells TypeScript it can accept any flat key-value object structure
  payload: Record<string, any>; 
}

export default function StructuralMetricViewer({ title, payload }: MetricViewerProps) {
  // If no data has arrived yet, display a subtle fallback
  if (!payload || Object.keys(payload).length === 0) {
    return (
      <div className="p-4 bg-white border border-zinc-200 rounded-xl">
        <p className="text-xs text-zinc-400 italic">No parameters initialized.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-2">
      <h3 className="text-sm font-bold text-zinc-800 border-b border-zinc-100 pb-2 mb-3">
        {title}
      </h3>
      
      <div className="space-y-1">
        {Object.entries(payload).map(([key, value]) => {
          
          let displayValue = String(value);
          if (typeof value === 'boolean') {
            displayValue = value ? 'Enabled' : 'Disabled';
          }

          return (
            <p 
              key={key} 
              className="text-xs text-zinc-600 flex justify-between border-b border-zinc-100 py-1 last:border-0"
            >
              <span className="font-medium text-zinc-500 capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              
              <span className="font-mono font-semibold text-zinc-900">
                {displayValue}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}