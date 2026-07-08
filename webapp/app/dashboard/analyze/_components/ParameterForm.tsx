'use client';

import React, { useState } from 'react';

export interface FilterConfig {
  id: string;        // Database column or state matching key
  label: string;     // UI Title text
  minLimit: number;
  maxLimit: number;
  step: number;
  unit: string;
}

export const TEAMP_FILTERS: FilterConfig[] = [
  { id: 'age',      label: 'Age Group',    minLimit: 18,  maxLimit: 100, step: 1,   unit: 'yrs' },
  { id: 'bmi',      label: 'BMI Range',    minLimit: 15,  maxLimit: 45,  step: 0.1, unit: '' },
  { id: 'distance', label: 'Distance',     minLimit: 0,   maxLimit: 50,  step: 0.5, unit: 'm' },
  { id: 'height',   label: 'Height',       minLimit: 120, maxLimit: 220, step: 1,   unit: 'cm' },
  { id: 'weight',   label: 'Weight',       minLimit: 40,  maxLimit: 160, step: 0.5, unit: 'kg' },
];

interface ParameterSliderProps {
  config: FilterConfig;
  values: [number, number];
  onChange: (min: number, max: number) => void;
}

interface ParameterProps{
  onClose: () => void;
}

function ParameterSlider({ config, values, onChange }: ParameterSliderProps) {
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
    <div className="w-full max-w-xs my-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl shadow-sm">
      {/* Label and Value Badge */}
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold text-zinc-700">
          {config.label}
        </label>
        <span className="text-[11px] font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
          {min} - {max} {config.unit}
        </span>
      </div>

      {/* Interactive Dual Slider Track Wrapper */}
      <div className="relative w-full h-5 flex items-center mt-2">
        {/* Background Track Line */}
        <div className="absolute left-0 right-0 h-1 bg-zinc-200 rounded-lg pointer-events-none" />
        
        {/* Dynamic Highlighted Range Fill */}
        <div 
          className="absolute h-1 bg-teal-700 rounded-lg pointer-events-none"
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

export default function ParameterForm({onClose} : ParameterProps) {
  // 1. Instantly sets up reactive min/max pairs for all array configurations
  const [filterStates, setFilterStates] = useState<Record<string, [number, number]>>(() => {
    return TEAMP_FILTERS.reduce((acc, filter) => {
      acc[filter.id] = [filter.minLimit, filter.maxLimit];
      return acc;
    }, {} as Record<string, [number, number]>);
  });

  const handleSliderChange = (id: string, min: number, max: number) => {
    setFilterStates(prev => ({
      ...prev,
      [id]: [min, max]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting your dynamic 20-slider values:", filterStates);
    //how do we turn the filter states into a database query and update accordingly
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto p-4">
      <div className="text-center">
        <h2 className="text-base font-bold text-zinc-800">
          The Parameters are as follows:
        </h2>
      </div>
      
      {/* 2. Dynamic Loop: Automatically draws sliders for all configuration criteria */}
      <div className="flex flex-col justify-center items-center">
        {TEAMP_FILTERS.map((filter) => (
          <ParameterSlider 
            key={filter.id} 
            config={filter} 
            values={filterStates[filter.id] || [filter.minLimit, filter.maxLimit]}
            onChange={(min, max) => handleSliderChange(filter.id, min, max)}
          />
        ))}
      </div>
      
      <button 
        type="submit"
        className="flex justify-center items-center text-center rounded-xl h-10 w-full bg-teal-800 text-zinc-100 font-semibold text-sm hover:bg-teal-700 transition-all shadow-sm"
      >
        Submit Parameters
      </button>
    </form>
  );
}