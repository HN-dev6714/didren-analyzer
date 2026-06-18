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
        <div>
            <div className="justify-center items-center">
                <Link href="/dashboard">
                    <button className="bg-zinc-800 text-zinc-100 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 transition-colors">
                        Return
                    </button>
                </Link>
                <h1 className="text-center text-zinc-700 text-2xl font-bold">
                    Analyzer Application
                </h1>
            </div>
        </div>
    )
}