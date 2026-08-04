"use client"
import Link from "next/link"
import { useSocket} from "@/app/context/SocketContext";
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDevices } from '@/app/context/DeviceContext';
import PayloadComponent from './payload'
import { ThemeToggle } from '@/components/ui/themeButton';
import { Card } from '@/components/ui/card';


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

    const [committedPatientData, setCommittedPatientData] = useState<PatientPayload>({
        first_name: '',
        surname: '',
        sex: 'Unspecified',
        language: 'EN',
        age: 30,
        height: 175,
        weight: 70,
    });

    const [committedSettingsData, setCommittedSettingsData] = useState<TestSettingsPayload>({
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
            targetId: "TEST_THERAPIST_123", // change to the active headset
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

        setCommittedPatientData({ ...patient });
        setCommittedSettingsData({ ...settings });
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

    function retrieveSessionInfo(){
        if (socket && isConnected && (socket.readyState === WebSocket.OPEN)) {
            socket.onmessage = (e) => {
                try {
                    const message = JSON.parse(e.data);
                    const incomingPatient = message?.payload?.patient_profile;
                    const incomingSettings = message?.payload?.test_configuration;

                    if (incomingPatient) {
                        setCommittedPatientData({
                            first_name: incomingPatient.firstName ?? '',
                            surname: incomingPatient.surname ?? '',
                            sex: incomingPatient.sex ?? 'Unspecified',
                            language: incomingPatient.language ?? 'EN',
                            age: typeof incomingPatient.age === 'number' ? incomingPatient.age : 0,
                            height: typeof incomingPatient.height === 'number' ? incomingPatient.height : 0,
                            weight: typeof incomingPatient.weight === 'number' ? incomingPatient.weight : 0,
                        });
                    }

                    if (incomingSettings) {
                        setCommittedSettingsData({
                            test_name: incomingSettings.testName ?? 'Horizontal',
                            angle: typeof incomingSettings.angle === 'number' ? incomingSettings.angle : 0,
                            distance: typeof incomingSettings.distance === 'number' ? incomingSettings.distance : 0,
                            accuracy: typeof incomingSettings.accuracy === 'number' ? incomingSettings.accuracy : 0,
                            radius: typeof incomingSettings.radius === 'number' ? incomingSettings.radius : 0,
                            target_height: typeof incomingSettings.targetHeight === 'number' ? incomingSettings.targetHeight : 0,
                            size: typeof incomingSettings.size === 'number' ? incomingSettings.size : 0,
                            cycles: typeof incomingSettings.cycles === 'number' ? incomingSettings.cycles : 0,
                            test_audio: Boolean(incomingSettings.enableAudio),
                            cursor_trail: Boolean(incomingSettings.enableTrail),
                            validation_time: typeof incomingSettings.validationTime === 'number' ? incomingSettings.validationTime : 0,
                        });
                    }

                    console.log("Live session info received from socket.");
                    console.log(message);
                } catch (error) {
                    console.error("Unable to parse websocket payload:", error);
                }
            }
        } else{
            console.error("Socket may be disconnected or offline");
        }
    }
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Pass both states directly into your transmission engine
        sendSessionSetup(formPatientData, formSettingsData);
    };

    useEffect(() => {
        if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
            retrieveSessionInfo();
        }
    }, [socket, isConnected]);

    if (isLoading) return <div>Loading!</div>
    if (errorMessage) return <div>Error! {errorMessage}</div>;

    return(
        <div>
            <div className="flex flex-col justify-center items-center w-full">
                <Link href="/dashboard">
                    <button className="absolute top-8 left-8 bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 flex justify-center items-center rounded h-8 w-20 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                        Return
                    </button>
                </Link>
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>
                <h1 className="text-center text-zinc-700 dark:text-zinc-100 text-4xl font-bold mb-12">
                    Testing Application
                </h1>
                <div className="flex justify-center mb-12 gap-8">
                    <h1 className="text-zinc-700 dark:text-zinc-100 text-2xl font-bold">
                        Select Headset:
                    </h1>
                    <select className="w-50 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 bg-white dark:bg-black rounded-md focus:outline-hidden focus:ring-2 focus:ring-teal-500">
                        {devices.map((device) => (
                            <option key={device.headset_serial} value={device.headset_serial}>
                                {device.nickname}
                            </option>
                        ))}
                    </select>
                    <Link 
                        href="/dashboard/test/add-headset"
                        className="flex justify-center items-center rounded h-8 w-32 bg-teal-600 text-zinc-100 font-medium text-sm hover:bg-teal-700 transition-colors"
                    >
                        Add Headset
                    </Link>
                </div>
                <div className="flex justify-center items-center gap-12 w-full">
                    <Card className="flex-1 bg-white dark:bg-black w-1/3 p-6">
                    <div className="flex flex-col px-12 w-full gap-4 mt-4">
                        <h3 className="text-center text-2xl font-bold underline text-zinc-700 dark:text-zinc-300">
                            Send Patient and Test Information to Headset:
                        </h3>
                        <div className="grid grid-cols-2 justify-center gap-8">
                            <div className="flex flex-col gap-4">
                                <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">Patient Data: </p>
                                <div>
                                    <label className="form-label">First Name</label>
                                    <input 
                                        type="text" required className="form-input"
                                        value={formPatientData.first_name} onChange={e => setFormPatientData({ ...formPatientData, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Surname</label>
                                    <input 
                                        type="text" required className="form-input"
                                        value={formPatientData.surname} onChange={e => setFormPatientData({ ...formPatientData, surname: e.target.value })}
                                    />
                                </div>
                                <div>
                                <label className="form-label">Sex</label>
                                    <select 
                                        className="form-input"
                                        value={formPatientData.sex} onChange={e => setFormPatientData({ ...formPatientData, sex: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Unspecified">Unspecified</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Language</label>
                                    <select 
                                        className="form-input"
                                        value={formPatientData.language} onChange={e => setFormPatientData({ ...formPatientData, language: e.target.value })}
                                    >
                                        <option value="English">EN</option>
                                        <option value="French">FR</option>
                                        <option value="Dutch">NL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Age</label>
                                    <input 
                                        type="number" className="form-input"
                                        value={formPatientData.age} onChange={e => setFormPatientData({ ...formPatientData, age: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Height (cm)</label>
                                    <input 
                                        type="number" className="form-input"
                                        value={formPatientData.height} onChange={e => setFormPatientData({ ...formPatientData, height: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Weight (kg)</label>
                                    <input 
                                        type="number" className="form-input"
                                        value={formPatientData.weight} onChange={e => setFormPatientData({ ...formPatientData, weight: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-200">
                                    <input 
                                        type="checkbox" className="h-4 w-4 bg-white rounded-sm border-zinc-300 text-teal-600 accent-teal-600"
                                        checked={formSettingsData.test_audio} onChange={e => setFormSettingsData({ ...formSettingsData, test_audio: e.target.checked })}
                                    />
                                    Enable Sound Assets
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-200">
                                    <input 
                                        type="checkbox" className="h-4 w-4 bg-white rounded-sm border-zinc-300 text-teal-600 accent-teal-600"
                                        checked={formSettingsData.cursor_trail} onChange={e => setFormSettingsData({ ...formSettingsData, cursor_trail: e.target.checked })}
                                    />
                                    Render Cursor Trail
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">Test Parameters: </p>
                                <div>
                                    <label className="form-label">Test Type</label>
                                    <select 
                                    className="form-input"
                                    value={formSettingsData.test_name} onChange={e => setFormSettingsData({ ...formSettingsData, test_name: e.target.value })}
                                    >
                                        <option value="Horizontal">Horizontal</option>
                                        <option value="Vertical">Vertical</option>
                                        <option value="Diagonal Left">Diagonal Left</option>
                                        <option value="Diagonal Right">Diagonal Right</option>
                                        <option value="Triangle Left">Triangle Left</option>
                                        <option value="Triangle Right">Triangle Right</option>
                                        <option value="Triangle Up">Triangle Up</option>
                                        <option value="Triangle Down">Triangle Down</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Angle (°)</label>
                                    <input 
                                        type="number" className="form-input"
                                        value={formSettingsData.angle} onChange={e => setFormSettingsData({ ...formSettingsData, angle: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Distance</label>
                                    <input 
                                        type="number" step="0.1" className="form-input"
                                        value={formSettingsData.distance} onChange={e => setFormSettingsData({ ...formSettingsData, distance: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Acc Threshold</label>
                                    <input 
                                        type="number" step="0.01" className="form-input"
                                        value={formSettingsData.accuracy} onChange={e => setFormSettingsData({ ...formSettingsData, accuracy: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Radius Ring</label>
                                    <input 
                                        type="number" step="0.1" className="form-input"
                                        value={formSettingsData.radius} onChange={e => setFormSettingsData({ ...formSettingsData, radius: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Target Height</label>
                                    <input 
                                        type="number" step="0.1" className="form-input"
                                        value={formSettingsData.target_height} onChange={e => setFormSettingsData({ ...formSettingsData, target_height: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Target Size</label>
                                    <input 
                                        type="number" step="0.1" className="form-input"
                                        value={formSettingsData.size} onChange={e => setFormSettingsData({ ...formSettingsData, size: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Total Cycles</label>
                                    <input 
                                        type="number" className="form-input"
                                        value={formSettingsData.cycles} onChange={e => setFormSettingsData({ ...formSettingsData, cycles: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Validation (s)</label>
                                    <input 
                                        type="number" step="0.1" className="form-input"
                                        value={formSettingsData.validation_time} onChange={e => setFormSettingsData({ ...formSettingsData, validation_time: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                        <button onClick={()=>serverCheck()} className="justify-center items-center bg-teal-600 hover:bg-teal-700 text-white rounded">Submit (Test Connection to Web Socket)</button>
                    </div>
                    </Card>
                    <div className="flex-1">
                        <h2 className="text-center font-bold text-2xl text-zinc-700 dark:text-zinc-100 mb-4">
                            Headset Live Feed
                        </h2>
                        <canvas className="bg-zinc-700 w-196 h-128">

                        </canvas>
                    </div>
                    <div className="flex-1">
                        <Card className="bg-white dark:bg-black p-6 mt-6">
                            <PayloadComponent title="Patient Data" payload={committedPatientData} />
                            <PayloadComponent title="Test Settings Data" payload={committedSettingsData} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}