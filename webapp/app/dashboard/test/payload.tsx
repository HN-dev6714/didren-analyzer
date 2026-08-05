import React from 'react';

//define what props this component expects to receive
interface MetricViewerProps {
  title: string;
  //tells TypeScript it can accept any flat key-value object structure
  payload: Record<string, any>; 
}

export default function StructuralMetricViewer({ title, payload }: MetricViewerProps) {
  //if no data has arrived yet, display a fallback
  if (!payload || Object.keys(payload).length === 0) {
    return (
      <div className="p-4 bg-white border border-zinc-200 rounded-xl">
        <p className="text-xs text-zinc-400 dark:text-zinc-100 italic">No parameters initialized.</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      <h3 className="text-sm font-bold underline text-zinc-800 dark:text-zinc-100 pb-2">
        {title}
      </h3>
      
      <div>
        {Object.entries(payload).map(([key, value]) => {
          
          //for every key in the payload, 
          let displayValue = String(value);
          //check if boolean
          if (typeof value === 'boolean') {
            displayValue = value ? 'Enabled' : 'Disabled';
          }
          //return the parameter (capitalized), and the display value (that we have converted into a string)
          return (
            <p 
              key={key} 
              className="text-xs text-zinc-600 dark:text-zinc-100 flex justify-between py-1 last:border-0"
            >
              <span className="font-medium text-zinc-500 dark:text-zinc-100 capitalize">
                {key.replace(/_/g, ' ')}:
              </span>
              
              <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-50 ">
                {displayValue}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}