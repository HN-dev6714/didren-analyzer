"use client"

import { Card, CardContent } from '@/components/ui/card';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from "next/link"
import { ThemeToggle } from '@/components/ui/themeButton';
import MagnifyingGlassIcon from '@/public/images/MagnifyingGlassIcon.svg';
import TargetIcon from '@/public/images/TargetIcon.svg';
import { createClient } from '@/utils/supabase/client';
import { useDevices } from '@/app/context/DeviceContext';

export default function DashboardOverviewPage() {

  const router = useRouter();
  const supabase = createClient();
  const { clearDevices } = useDevices();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      clearDevices();

      localStorage.clear();
      sessionStorage.clear();

      router.push('/');
      router.refresh(); 
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-screen justify-start items-center p-6">
        <button onClick={handleLogout} className="absolute top-8 left-8 bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-800 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 transition-colors">
          Log Out
        </button>
      <div className="absolute top-8 right-8">
        <ThemeToggle/>
      </div>

      <div className="flex flex-col justify-center items-center mb-12">
        <h1 className="text-6xl font-bold text-teal-700 dark:text-teal-300 tracking-tight mb-4 text-center">
          DidRen Analyzer
        </h1>
        <h2 className="text-zinc-600 dark:text-zinc-300 font-bold text-2xl text-center">
          Welcome
        </h2>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-2 place-items-center gap-12 w-4/5 h-4/5">
        <Link className="h-full w-4/5 block" href="/dashboard/test">
          <Card className="h-full w-full">
            <CardContent className="flex flex-col h-full justify-center items-center p-8">
              <TargetIcon className="w-full h-full h-3/4 dark:text-teal-400 text-teal-600" />
              <h2 className="mt-auto text-3xl font-bold text-center">
                Test
              </h2>
            </CardContent>
          </Card>
        </Link>

        <Link className="h-full w-4/5 block" href="/dashboard/analyze">
          <Card className="h-full w-full">
            <CardContent className="flex flex-col h-full justify-center items-center p-8">
              <MagnifyingGlassIcon className="w-full h-full h-3/4 dark:text-teal-400 text-teal-600" />
              <h2 className="mt-auto text-3xl font-bold text-center">
                Analyze
              </h2>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
  //TODO: Decide how the dashboard will look for each user. 
  //Depends on whether clinical or researcher version. How to identify?
}