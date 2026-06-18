"use client"
import Link from "next/link"
/**
 * This is where the Clinician/Researcher will test patients
 * 
 * The following (proposed) specifications are as follows:
 * - The user will select a given headset or be given the option to add a headset. 
 * - If the user decides to add a headset, a pop-up modal will appear 
 * (how do we establish a connection?) asking for a six-digit code. This six-digit code
 * would be sent to the device and must be typed in the user account to be connected. 
 * - If the user decides to select an already using headset (that is linked to that userID
 * in Supabase), it must check if
 * the camera is on (the device is powered on) and currently within the application
 * - Once a headset is selected, the user will be able to type in patient and test parameters 
 * (this may have to rewire how the headset receives a test)
 * - The headset could also be screened as a live video feed to this part. On the left hand side, 
 * there is information about the patient and the test. 
 * A back button to return to the dashboard
 * 
 * 
 */
export default function TestingPage(){

    return(
        <div>
            <div className="justify-center items-center">
                <Link href="/dashboard">
                    <button className="bg-zinc-800 text-zinc-100 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 transition-colors">
                        Return
                    </button>
                </Link>
                <h1 className="text-center text-zinc-700 text-2xl font-bold">
                    Testing Application
                </h1>
            </div>
        </div>
    )
}