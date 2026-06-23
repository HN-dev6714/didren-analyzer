"use client"
import Link from "next/link"
import { useSocket} from "@/app/context/SocketContext";
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

    const { socket, isConnected } = useSocket();

    function serverCheck() {
        if (socket && isConnected && (socket.readyState === WebSocket.OPEN)) {
            const clickTestMessage = {
                targetId: "TEST_THERAPIST_123",
                action: "BUTTON_CLICK_TEST",
                payload: { text: "Clicked cleanly using React context hooks!" }
            };
            
            socket.send(JSON.stringify(clickTestMessage));
            console.log("Message successfully dispatched.");
        } else {
            console.error("The managed socket is currently disconnected or offline.");
        }
    }

    return(
        <div>
            <div className="flex flex-col justify-center items-center w-full">
                <Link href="/dashboard">
                    <button className="absolute top-8 left-8 bg-zinc-800 text-zinc-100 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 transition-colors">
                        Return
                    </button>
                </Link>
                <h1 className="text-center text-zinc-700 text-4xl font-bold mb-12">
                    Testing Application
                </h1>
                <div className="flex justify-center mb-12 gap-8">
                    <h1 className="text-zinc-700 text-2xl font-bold">
                        Select Headset:
                    </h1>
                    <select>
                        <option value="Sample Headset A">Sample Headset A</option>
                        <option value="Sample Headset B">Sample Headset B</option>
                        <option value="Sample Headset C">Sample Headset C</option>
                    </select>
                    <Link 
                        href="/dashboard/test/add-headset"
                        className="flex justify-center items-center rounded h-8 w-32 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700 transition-colors"
                    >
                        Add Headset
                    </Link>
                </div>
                <div className="flex justify-center items-center">
                    <div className="flex flex-col px-12 w-160 gap-1">
                        <h3 className="text-center text-2xl font-bold underline">
                            Testing Information
                        </h3>
                        <p className="text-base font-bold underline">Patient Data: </p>
                        <p className="text-sm">Stat 1:</p>
                        <p className="text-sm">Stat 2:</p>
                        <p className="text-sm">Stat 3:</p>
                        <p className="text-sm">Stat 4:</p>
                        <p className="text-sm">Stat 5:</p>
                        <p className="text-sm">Stat 6:</p>
                        <p className="text-base font-bold underline">Test Parameters: </p>
                        <p className="text-sm">Stat 1:</p>
                        <p className="text-sm">Stat 2:</p>
                        <p className="text-sm">Stat 3:</p>
                        <p className="text-sm">Stat 4:</p>
                        <p className="text-sm">Stat 5:</p>
                        <p className="text-sm">Stat 6:</p>
                        <p className="text-sm">Stat 7:</p>
                        <p className="text-sm">Stat 8:</p>
                        <p className="text-sm">Stat 9:</p>
                        <p className="text-sm">Stat 10:</p>
                        <p className="text-sm">Stat 11:</p>
                        <p className="text-sm">Stat 12:</p>
                        <button onClick={()=>serverCheck()} className="justify-center items-center bg-teal-800 text-white rounded">Test connection to web socket</button>
                    </div>
                    <div className="">
                        <h2 className="text-center font-bold text-2xl text-zinc-700 mb-4">
                            Headset Live Feed
                        </h2>
                        <canvas className="bg-zinc-700 w-192 h-128">

                        </canvas>
                    </div>
                </div>
            </div>
        </div>
    )
}