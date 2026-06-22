"use client"
import Link from "next/link"

/**
 * This is where the Clinician/Researcher will analyze data
 * 
 * Here are the proposed specifications:
 * - Depending on whether the role is a Clinician or a Researcher, specific data will be shown
 * (so some pieces of data such as acceleration may not be visible for Clinicians)
 * - We will fetch all headsets in the Therapist-Headset intermediary table and list all sessions possible 
 * in a...drop-down menu? A calendar? 
 * - Users can choose by session or select multiple sessions with filters. They can filter by accessible
 * patient name, patient parameters, a specific test parameter, or a set of test parameters
 * - There will be options to select what types of data will be shown. 
 * - The users will be shown a graph with data points they decide to pick out: from MotionData
 * - They will also be shown overall statistics of that session below the graph: max's and min's will have 
 * to be recalculated if multiple sessions are selected. Averages and means could be a little
 * complicated as some sessions are longer than others...we're wondering if we must weight them properly.
 * - Obviously a back button to return to the dashboard. 
 */


export default function AnalyzingPage(){
    return(
        <div className="flex flex-col">
            <div className="justify-center items-center mb-10">
                <Link href="/dashboard">
                    <button className="bg-zinc-800 text-zinc-100 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 transition-colors">
                        Return
                    </button>
                </Link>
                <h1 className="text-center text-zinc-700 text-5xl font-bold">
                    Analyzer Application
                </h1>
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="text-center font-bold text-xl  text-zinc-800 mb-2">
                    Graph Filters
                </h2>
                <div className="flex gap-2">
                    <div className="flex gap-1">
                        <p>Filter 1:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 2:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 3:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 4:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 5:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 6:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 7:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 8:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex gap-1">
                        <p>Filter 1:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 2:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 3:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 4:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 5:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 6:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 7:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex gap-1">
                        <p>Filter 8:</p>
                        <input 
                            type="text" 
                            className="text-small w-28 h-6 px-3 py-2 bg-zinc-200 border border-zinc-200 rounded text-zinc-800 focus:outline-none focus:border-teal-500"
                        />
                    </div>
                </div>
            </div>
            <div className="flex w-full justify-center items-center">
                <canvas className="w-256 h-128 mt-8 mb-4 bg-zinc-700">
                     
                </canvas>
            </div>
            <div className="flex flex-col w-full justify-center items-center">
                <h2 className="text-center text-3xl font-bold">
                    Overall Statistics:
                </h2>
                <div className="flex w-160 gap-48 bg-zinc-200">
                    <div className="flex flex-col">
                        <p className="text-base">
                            Stat: 1
                        </p>
                        <p className="text-base">
                            Stat: 2
                        </p>
                        <p className="text-base">
                            Stat: 3
                        </p>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-base">
                            Stat: 1
                        </p>
                        <p className="text-base">
                            Stat: 2
                        </p>
                        <p className="text-base">
                            Stat: 3
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}