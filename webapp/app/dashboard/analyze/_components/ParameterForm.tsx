'use client';

import React from 'react';

function ParameterComponent({ name }: { name: string }) {
  return (
    <div className="w-full max-w-xs my-2">
      <label className="block text-xs font-semibold text-zinc-500 capitalize mb-1">
        {name}
      </label>
      <input 
        type="text"
        placeholder="Type here..." 
        className="w-full p-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
      />
    </div>
  );
}

export default function ParameterForm() {

  const paramRows: React.ReactNode[] = [];
  const paramFilters = ["Age", "Gender", "BMI", "Their Name? Idk"];

  paramFilters.forEach((param) => {
    paramRows.push(
      <ParameterComponent key={param} name={param} />
    );
  });

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-zinc-700">
        The Parameters are as follows:
      </h2>
      
      <div className="flex flex-col justify-center items-center">
        {paramRows}
      </div>
      
      <button className="flex justify-center items-center text-center rounded h-8 w-48 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700 transition-colors mx-auto">
        Submit Parameters
      </button>
    </div>
  );
}