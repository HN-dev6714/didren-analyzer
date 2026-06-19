"use client"

import { Card, CardContent } from '@/components/ui/card';
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardOverviewPage() {
  return (
    <div className="relative flex flex-col w-full justify-center items-center p-8">
      <Link href="/">
        <button className="absolute top-8 right-8 bg-zinc-800 text-zinc-100 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 transition-colors">
          Log Out
        </button>
      </Link>

      <div className="flex flex-col justify-center items-center mb-16">
        <h1 className="text-3xl font-bold text-teal-700 tracking-tight mb-4 text-center">
          DidRen Analyzer
        </h1>
        <h2 className="text-zinc-600 font-bold text-lg text-center">
          Welcome
        </h2>
      </div>

      {/* Cards Section */}
      <div className="flex justify-center items-center gap-12">
        <Link href="/dashboard/test">
          <Card className="h-96 w-128">
            <CardContent className="flex flex-col h-full">
              <h2 className="mt-auto text-2xl font-bold text-center">
                Test
              </h2>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analyze">
          <Card className="h-96 w-128">
            <CardContent className="flex flex-col h-full">
              <h2 className="mt-auto text-2xl font-bold text-center">
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