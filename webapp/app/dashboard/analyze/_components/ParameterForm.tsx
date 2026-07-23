'use client';

import React, { useState } from 'react';

export type FilterType = 'range' | 'select' ;

export interface BaseFilterConfig {
  id: string;
  label: string;
  type: FilterType;
}

export interface RangeFilterConfig extends BaseFilterConfig {
  type: 'range';
  minLimit: number;
  maxLimit: number;
  step: number;
  unit: string;
}

export interface SelectFilterConfig extends BaseFilterConfig {
  type: 'select';
  options: { value: string; label: string }[];
  isMulti?: boolean; // Can use true for your multi-select requirements
}

export type FilterConfig = RangeFilterConfig | SelectFilterConfig;

export const TEAMP_FILTERS: FilterConfig[] = [
  { 
    id: 'sex', 
    label: 'Sex', 
    type: 'select', 
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ]
  },
  { 
    id: 'test_name', 
    label: 'Test Name', 
    type: 'select', 
    options: [
      { value: 'Horizontal', label: 'Horizontal' },
      { value: 'Vertical', label: 'Vertical' },
      { value: 'Diagonal Left', label: 'Diagonal Left' }
    ]
  },
  {
    id: 'cursor_trail',
    label: 'Cursor Trail',
    type: 'select',
    options: [
      { value: 'true', label: 'Trail Enabled' },
      { value: 'false', label: 'Trail Disabled' }
    ]
  },
  {
    id: 'test_audio',
    label: 'Test Audio',
    type: 'select',
    options: [
      { value: 'true', label: 'Audio Enabled' },
      { value: 'false', label: 'Audio Disabled' }
    ]
  },

  { id: 'age',      label: 'Age Group',    type: 'range', minLimit: 18,  maxLimit: 100, step: 1,   unit: 'yrs' },
  { id: 'bmi',      label: 'BMI Range',    type: 'range', minLimit: 15,  maxLimit: 45,  step: 0.1, unit: '' },
  { id: 'height',   label: 'Height',       type: 'range', minLimit: 120, maxLimit: 220, step: 1,   unit: 'cm' },
  { id: 'weight',   label: 'Weight',       type: 'range', minLimit: 40,  maxLimit: 160, step: 0.5, unit: 'kg' },
  { id: 'distance',   label: 'Target Distance',       type: 'range', minLimit: 1,  maxLimit: 5, step: 0.5, unit: '' },
  { id: 'angle',   label: 'Angle',       type: 'range', minLimit: 0,  maxLimit: 60, step: 0.5, unit: ' degrees' },
  { id: 'space',   label: 'Space',       type: 'range', minLimit: 0,  maxLimit: 8.7, step: 0.1, unit: '' },
  { id: 'accuracy',   label: 'Accuracy',       type: 'range', minLimit: 1,  maxLimit: 4, step: 0.5, unit: '' },
  { id: 'radius',   label: 'Radius',       type: 'range', minLimit: 0.1,  maxLimit: 0.7, step: 0.05, unit: '' },
  { id: 'target_height',   label: 'Target Height',       type: 'range', minLimit: -1,  maxLimit: 1, step: 0.5, unit: '' },
  { id: 'size',   label: 'Target Size',       type: 'range', minLimit: 0.25,  maxLimit: 1, step: 0.05, unit: '' },
  { id: 'cycles',   label: 'Cycles',       type: 'range', minLimit: 1,  maxLimit: 10, step: 1, unit: ' cycles' },
  { id: 'validation_time',   label: 'Validation Time',       type: 'range', minLimit: 0.1,  maxLimit: 1.5, step: 0.1, unit: ' sec' },
];

interface ParameterProps{
  onSubmitFilters: (filters: Record<string, any>) => void; //can we keep this?
  currentFilters?: Record<string, any>;
}

//for multi-select things
function ParameterSelect({ config, value, onChange }: { config: SelectFilterConfig; value: string[]; onChange: (val: string[]) => void }) {
  const handleToggleOption = (val: string) => {
    // Basic multi-select logic: add if missing, remove if present
    if (value.includes(val)) {
      onChange(value.filter(item => item !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="w-full max-w-xs my-4 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-100 block mb-2">{config.label}</label>
      <div className="flex flex-wrap gap-1.5">
        {config.options.map((opt) => {
          const isSelected = value.includes(opt.value);
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => handleToggleOption(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                isSelected 
                  ? 'bg-teal-700 text-white border-teal-700 dark:bg-teal-600 shadow-sm' 
                  : 'bg-white text-zinc-600 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:bg-black dark:text-zinc-100'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ParameterSlider({ config, values, onChange }: {config: RangeFilterConfig; values: [number, number]; onChange: (min: number, mix: number) => void }) {
  const [min, max] = values;

  // Track handle logic to prevent min crossing over max
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), max - config.step);
    onChange(val, max);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), min + config.step);
    onChange(min, val);
  };

  return (
    <div className="w-full max-w-xs my-4 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm">
      {/* Label and Value Badge */}
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-100">
          {config.label}
        </label>
        <span className="text-[11px] font-mono font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
          {min} - {max} {config.unit}
        </span>
      </div>

      {/* Interactive Dual Slider Track Wrapper */}
      <div className="relative w-full h-5 flex items-center mt-2">
        {/* Background Track Line */}
        <div className="absolute left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg pointer-events-none" />
        
        {/* Dynamic Highlighted Range Fill */}
        <div 
          className="absolute h-1 bg-teal-700 dark:bg-teal-400 rounded-lg pointer-events-none"
          style={{
            left: `${((min - config.minLimit) / (config.maxLimit - config.minLimit)) * 100}%`,
            right: `${100 - ((max - config.minLimit) / (config.maxLimit - config.minLimit)) * 100}%`
          }}
        />

        {/* Minimum Thumb Slider */}
        <input 
          type="range"
          min={config.minLimit}
          max={config.maxLimit}
          step={config.step}
          value={min}
          onChange={handleMinChange}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none cursor-pointer accent-teal-700 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-700"
        />

        {/* Maximum Thumb Slider */}
        <input 
          type="range"
          min={config.minLimit}
          max={config.maxLimit}
          step={config.step}
          value={max}
          onChange={handleMaxChange}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none cursor-pointer accent-teal-700 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-700"
        />
      </div>

      {/* Axis Limit Markers */}
      <div className="flex justify-between text-[10px] text-zinc-400 font-medium mt-1">
        <span>{config.minLimit}{config.unit}</span>
        <span>{config.maxLimit}{config.unit}</span>
      </div>
    </div>
  );
}

export default function ParameterForm({onSubmitFilters, currentFilters} : ParameterProps) {
  
  const [filterStates, setFilterStates] = useState<Record<string, any>>(() => {
    if (currentFilters && Object.keys(currentFilters).length > 0) {
      return currentFilters;
    }
    
    return TEAMP_FILTERS.reduce((acc, filter) => {
      if (filter.type === 'range') {
        acc[filter.id] = [filter.minLimit, filter.maxLimit];
      } else if (filter.type === 'select') {
        acc[filter.id] = []; // Empty array means "everything selected/no constraint"
      }
      return acc;
    }, {} as Record<string, any>);
  });

  const handleValueChange = (id: string, value: any) => {
    setFilterStates(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFilters(filterStates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto p-4">
      <div className="text-center">
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
          The Parameters are as follows:
        </h2>
      </div>
      
      {/* 2. Dynamic Loop: Automatically draws sliders for all configuration criteria */}
      <div className="flex flex-col justify-center items-center">
        {TEAMP_FILTERS.map((filter) => {
          // Dynamic Polymorphic Component Dispatching Matcher
          if (filter.type === 'range') {
            return (
              <ParameterSlider
                key={filter.id}
                config={filter}
                values={filterStates[filter.id]}
                onChange={(min, max) => handleValueChange(filter.id, [min, max])}
              />
            );
          }
          if (filter.type === 'select') {
            return (
              <ParameterSelect
                key={filter.id}
                config={filter}
                value={filterStates[filter.id] || []}
                onChange={(newVal) => handleValueChange(filter.id, newVal)}
              />
            );
          }
          return null;
        })}
      </div>
      
      <button 
        type="submit"
        className="flex justify-center items-center text-center rounded-xl h-10 w-full bg-teal-800 dark:bg-teal-600 text-zinc-100 font-semibold text-sm hover:bg-teal-700 transition-all shadow-sm"
      >
        Submit Parameters
      </button>
    </form>
  );
}