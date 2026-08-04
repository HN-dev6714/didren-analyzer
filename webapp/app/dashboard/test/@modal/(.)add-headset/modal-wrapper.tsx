// app/test/@modal/(.)add-headset/modal-wrapper.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ModalWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <div 
      onClick={() => router.back()} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-md bg-zinc-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl"
      >
        {children}
      </div>
    </div>
  );
}