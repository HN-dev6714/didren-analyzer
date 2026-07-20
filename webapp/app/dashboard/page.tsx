"use client"

import { Card, CardContent } from '@/components/ui/card';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from "next/link"

export default function DashboardOverviewPage() {
  return (
    <div className="relative flex flex-col w-full h-screen justify-start items-center p-6">
      <Link href="/">
        <button className="absolute top-8 right-8 bg-zinc-800 text-zinc-100 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 transition-colors">
          Log Out
        </button>
      </Link>

      <div className="flex flex-col justify-center items-center mb-12">
        <h1 className="text-6xl font-bold text-teal-700 tracking-tight mb-4 text-center">
          DidRen Analyzer
        </h1>
        <h2 className="text-zinc-600 font-bold text-2xl text-center">
          Welcome
        </h2>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-2 place-items-center gap-12 w-4/5 h-4/5">
        <Link className="h-full w-4/5 block" href="/dashboard/test">
          <Card className="h-full w-full">
            <CardContent className="flex flex-col h-full justify-center items-center p-8">
              <div className="relative flex w-full h-3/4 justify-center items-center">
                <Image src="/images/TargetIcon.svg" alt="TargetLogo" fill/>
              </div>
              <h2 className="mt-auto text-3xl font-bold text-center">
                Test
              </h2>
            </CardContent>
          </Card>
        </Link>

        <Link className="h-full w-4/5 block" href="/dashboard/analyze">
          <Card className="h-full w-full">
            <CardContent className="flex flex-col h-full justify-center items-center p-8">
              <div className="relative flex w-full h-3/4 justify-center items-center">
                <Image src="/images/MagnifyingGlassIcon.svg" alt="TargetLogo" fill />
              </div>
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