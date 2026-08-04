'use client';

import Link from 'next/link';
import { AddHeadsetForm } from './form';

export default function AddHeadsetFullPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
        <AddHeadsetForm />
      </div>

    </div>
  );
}