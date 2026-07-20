"use client"
import Link from "next/link"
import { useSocket} from "@/app/context/SocketContext";
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDevices } from '@/app/context/DeviceContext';
import PayloadComponent from './payload'


interface DeviceCode {
    headset_serial: string;
    code: string;
    expiration: string;
}

interface PatientPayload{
    first_name: string;
    surname: string;
    sex: string;
    language: string;
    age: number;
    height: number;
    weight: number;
}

interface TestSettingsPayload{
    test_name: string;
    angle: number;
    distance: number;
    accuracy: number;
    radius: number;
    target_height: number;
    size: number;
    cycles: number;
    test_audio: boolean;
    cursor_trail: boolean;
    validation_time: number;
}
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
 */
export default function TestingPage(){

    const { devices, isLoading } = useDevices();
    const [errorMessage, setErrorMessage] = useState('');
    const { socket, isConnected } = useSocket();
    const [formPatientData, setFormPatientData] = useState<PatientPayload>({
        first_name: '',
        surname: '',
        sex: 'Unspecified',
        language: 'EN',
        age: 30,
        height: 175, 
        weight: 70, 
    });
    const [formSettingsData, setFormSettingsData] = useState<TestSettingsPayload>({
        test_name: 'Horizontal',
        angle: 0,
        distance: 2.0,
        accuracy: 0.95,
        radius: 0.5,
        target_height: 1.2,
        size: 1.0,
        cycles: 10,
        test_audio: true,
        cursor_trail: false,
        validation_time: 1.5
    });

    function sendSessionSetup(patient: PatientPayload, settings: TestSettingsPayload) {
    // 1. Ensure the socket exists and is in the OPEN state before trying to send
    if (socket && isConnected && (socket.readyState === WebSocket.OPEN)) {
        
        const runtimeSetupMessage = {
            targetId: "TEST_THERAPIST_123", // Replace dynamically with the active headset ID if needed
            action: "LOAD_SESSION",
            payload: {
                patient_profile: {
                    firstName: patient.first_name,
                    surname: patient.surname,
                    sex: patient.sex,
                    language: patient.language,
                    age: patient.age,
                    height: patient.height,
                    weight: patient.weight
                },
                test_configuration: {
                    testName: settings.test_name,
                    angle: settings.angle,
                    distance: settings.distance,
                    accuracy: settings.accuracy,
                    radius: settings.radius,
                    targetHeight: settings.target_height,
                    size: settings.size,
                    cycles: settings.cycles,
                    enableAudio: settings.test_audio,
                    enableTrail: settings.cursor_trail,
                    validationTime: settings.validation_time
                }
            }
        };

        socket.send(JSON.stringify(runtimeSetupMessage));
        console.log("Session parameters successfully synchronized to the server.");
    } else {
        console.error("Cannot dispatch: The managed socket is currently offline or uninitialized.");
    }
}

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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Pass both states directly into your transmission engine
        sendSessionSetup(formPatientData, formSettingsData);
    };

    if (isLoading) return <div>Loading!</div>
    if (errorMessage) return <div>Error! {errorMessage}</div>;

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
                        {devices.map((device) => (
                            <option key={device.headset_serial} value={device.headset_serial}>
                                Headset ({device.headset_serial.substring(0, 8)})
                            </option>
                        ))}
                    </select>
                    <Link 
                        href="/dashboard/test/add-headset"
                        className="flex justify-center items-center rounded h-8 w-32 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700 transition-colors"
                    >
                        Add Headset
                    </Link>
                </div>
                <div className="flex justify-center items-center gap-12 w-300">
                    <div className="flex-1">
                        <PayloadComponent title="Patient Data" payload={formPatientData} />
                        <PayloadComponent title="Test Settings Data" payload={formSettingsData} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-center font-bold text-2xl text-zinc-700 mb-4">
                            Headset Live Feed
                        </h2>
                        <canvas className="bg-zinc-700 w-192 h-128">

                        </canvas>
                    </div>
                </div>
                <div className="flex flex-col px-12 w-160 gap-4 mt-8">
                        <h3 className="text-center text-2xl font-bold underline">
                            Set Patient and Test Information on Headset:
                        </h3>
                        <div className="grid grid-cols-2 justify-center items-center gap-8">
                            <div className="flex flex-col gap-4">
                                <p className="text-base font-bold underline">Patient Data: </p>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">First Name</label>
                                    <input 
                                        type="text" required className="w-full px-3 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formPatientData.first_name} onChange={e => setFormPatientData({ ...formPatientData, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Surname</label>
                                    <input 
                                        type="text" required className="w-full px-3 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formPatientData.surname} onChange={e => setFormPatientData({ ...formPatientData, surname: e.target.value })}
                                    />
                                </div>
                                <div>
                                <label className="block text-xs font-semibold text-zinc-600 mb-1">Sex</label>
                                    <select 
                                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formPatientData.sex} onChange={e => setFormPatientData({ ...formPatientData, sex: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Unspecified">Unspecified</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Language</label>
                                    <select 
                                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formPatientData.language} onChange={e => setFormPatientData({ ...formPatientData, language: e.target.value })}
                                    >
                                        <option value="English">EN</option>
                                        <option value="French">FR</option>
                                        <option value="Dutch">NL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Age</label>
                                    <input 
                                        type="number" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formPatientData.age} onChange={e => setFormPatientData({ ...formPatientData, age: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Height (cm)</label>
                                    <input 
                                        type="number" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formPatientData.height} onChange={e => setFormPatientData({ ...formPatientData, height: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Weight (kg)</label>
                                    <input 
                                        type="number" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formPatientData.weight} onChange={e => setFormPatientData({ ...formPatientData, weight: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <p className="text-base font-bold underline">Test Parameters: </p>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Test Type</label>
                                    <select 
                                    className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                    value={formSettingsData.test_name} onChange={e => setFormSettingsData({ ...formSettingsData, test_name: e.target.value })}
                                    >
                                        <option value="Horizontal">Horizontal</option>
                                        <option value="Vertical">Vertical</option>
                                        <option value="Diagonal Left">Diagonal Left</option>
                                        <option value="Diagonal Right">Diagonal Right</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Angle (°)</label>
                                    <input 
                                        type="number" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.angle} onChange={e => setFormSettingsData({ ...formSettingsData, angle: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Distance</label>
                                    <input 
                                        type="number" step="0.1" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.distance} onChange={e => setFormSettingsData({ ...formSettingsData, distance: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Acc Threshold</label>
                                    <input 
                                        type="number" step="0.01" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.accuracy} onChange={e => setFormSettingsData({ ...formSettingsData, accuracy: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Radius Ring</label>
                                    <input 
                                        type="number" step="0.1" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.radius} onChange={e => setFormSettingsData({ ...formSettingsData, radius: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Target Height</label>
                                    <input 
                                        type="number" step="0.1" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.target_height} onChange={e => setFormSettingsData({ ...formSettingsData, target_height: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Target Size</label>
                                    <input 
                                        type="number" step="0.1" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.size} onChange={e => setFormSettingsData({ ...formSettingsData, size: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Total Cycles</label>
                                    <input 
                                        type="number" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.cycles} onChange={e => setFormSettingsData({ ...formSettingsData, cycles: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Validation (s)</label>
                                    <input 
                                        type="number" step="0.1" className="w-full px-2 py-1.5 text-sm border border-zinc-300 bg-white rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                                        value={formSettingsData.validation_time} onChange={e => setFormSettingsData({ ...formSettingsData, validation_time: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex gap-6 pt-2 border-t border-zinc-100">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600">
                                    <input 
                                        type="checkbox" className="h-4 w-4 bg-white rounded-sm border-zinc-300 text-teal-600 accent-teal-600"
                                        checked={formSettingsData.test_audio} onChange={e => setFormSettingsData({ ...formSettingsData, test_audio: e.target.checked })}
                                    />
                                    Enable Sound Assets
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600">
                                    <input 
                                        type="checkbox" className="h-4 w-4 bg-white rounded-sm border-zinc-300 text-teal-600 accent-teal-600"
                                        checked={formSettingsData.cursor_trail} onChange={e => setFormSettingsData({ ...formSettingsData, cursor_trail: e.target.checked })}
                                    />
                                    Render Cursor Trail
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button onClick={()=>serverCheck()} className="justify-center items-center bg-teal-800 text-white rounded">Submit (Test Connection to Web Socket)</button>
                    </div>
            </div>
        </div>
    )
}