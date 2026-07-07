"use client"
import { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link"
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import AnalysisModal from './_components/AnalysisModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export interface Session{
    session_id: string; // or number, depending on your DB configuration
    headset_serial_number: string;
    patient_id?: string;      // Optional fields for your filters
    config_id?: string;   
    session_timestamp?: string;
    // This matches the nested object structure Supabase returns for the join:
    therapist_headset_map: {
        therapist_id: string;
    }[];

    patients: {
        first_name: string;
        surname: string;
    } | null;

    motion_data: MotionDataPoint[];
}

export interface MotionDataPoint {
  timestamp_delta: number;

  acc_x: number;
  acc_y: number;
  acc_z: number;
  vel_x: number;
  vel_y: number;
  vel_z: number;
  pos_x: number;
  pos_y: number;
  pos_z: number;

  ang_acc_x: number;
  ang_acc_y: number;
  ang_acc_z: number;
  ang_vel_x: number;
  ang_vel_y: number;
  ang_vel_z: number;
  ang_x: number;
  ang_y: number;
  ang_z: number;
}

export const METRIC_OPTIONS = [
  { value: 'acc_x', label: 'Acceleration (X-Axis)' },
  { value: 'acc_y', label: 'Acceleration (Y-Axis)' },
  { value: 'acc_z', label: 'Acceleration (Z-Axis)' },
  { value: 'vel_x',     label: 'Velocity (X-Axis)' },
  { value: 'vel_y',     label: 'Velocity (Y-Axis)' },
  { value: 'vel_z',     label: 'Velocity (Z-Axis)' },
  { value: 'pos_x',     label: 'Position (X-Axis)' },
  { value: 'pos_y',     label: 'Position (Y-Axis)' },
  { value: 'pos_z',     label: 'Position (X-Axis)' },
  { value: 'ang_acc_x', label: 'Angular Acceleration (X-Axis)' },
  { value: 'ang_acc_y', label: 'Angular Acceleration (Y-Axis)' },
  { value: 'ang_acc_z', label: 'Angular Acceleration (Z-Axis)' },
  { value: 'ang_vel_x',     label: 'Angular Velocity (X-Axis)' },
  { value: 'ang_vel_y',     label: 'Angular Velocity (Y-Axis)' },
  { value: 'ang_vel_z',     label: 'Angular Velocity (Z-Axis)' },
  { value: 'ang_x',        label: 'Angle (X-Axis)' },
  { value: 'ang_y',        label: 'Angle (Y-Axis)' },
  { value: 'ang_z',        label: 'Angle (Z-Axis)' },
] as const;

export type MetricParameter = typeof METRIC_OPTIONS[number]['value'];
/**
 * This is where the Clinician/Researcher will analyze data
 * 
 * Here are the proposed specifications:
 * - Depending on whether the role is a Clinician or a Researcher, specific data will be shown
 * (so some pieces of data such as acceleration may not be visible for Clinicians)
 * - We will fetch all headsets in the Therapist-Headset intermediary table and list all sessions possible 
 * in a...drop-down menu? A calendar?  (we already did this in a very different page. )
 * - Users can choose by session or select multiple sessions with filters. They can filter by accessible
 * patient name, patient parameters, a specific test parameter, or a set of test parameters
 * - There will be options to select what types of data will be shown. 
 * - The users will be shown a graph with data points they decide to pick out: from MotionData
 * - They will also be shown overall statistics of that session below the graph: max's and min's will have 
 * to be recalculated if multiple sessions are selected. Averages and means could be a little
 * complicated as some sessions are longer than others...we're wondering if we must weight them properly.
 */

export default function AnalyzingPage() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    
    const supabase = createClient();
    const showAdvancedMetrics = userRole === 'researcher';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeParameter, setActiveParameter] = useState<MetricParameter>('acc_x');
    const lineColors = ['#0f766e', '#4338ca', '#b45309', '#be185d', '#1d4ed8'];

    const chartData = useMemo(() => {
        // Filter down to only sessions chosen by the therapist checkboxes
        const activeSessions = sessions.filter(s => selectedSessionIds.includes(s.session_id));
        if (activeSessions.length === 0) return [];

        // Find the longest session profile record to construct our baseline master timeline axis layout
        const longestSession = activeSessions.reduce((max, s) => 
            s.motion_data.length > max.motion_data.length ? s : max, activeSessions[0]
        );

        // Re-map the timeline coordinates into unified row snapshots
        return longestSession.motion_data.map((basePoint, index) => {
            // Every row needs a shared X-Axis baseline timestamp
            const dataRow: any = { timestamp: basePoint.timestamp_delta };

            // Inject data from every active session matching this chronological moment index
            activeSessions.forEach((session) => {
            const targetPoint = session.motion_data[index];
            if (targetPoint) {
                // Use the session_id string descriptor key as the data key pathway
                dataRow[session.session_id] = targetPoint[activeParameter];
            }
            });

            return dataRow;
        });
    }, [selectedSessionIds, activeParameter, sessions]);

    const handleToggleSession = (sessionId: string) => {
        setSelectedSessionIds((prevSelected) =>
        prevSelected.includes(sessionId)
            ? prevSelected.filter((id) => id !== sessionId)
            : [...prevSelected, sessionId] 
        );
    };

    const handleSubmitSelection = () => {
        console.log("Sending these IDs to Recharts:", selectedSessionIds);
        // Close the modal?

        // Pass selectedSessionIds to your Recharts graph component
    };


    useEffect(() => {

        async function retrieveSessions() {
            try {
                setIsLoading(true);
                setErrorMessage('');
                //get therapist info
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) return;

                const { data: mappings, error: mapError } = await supabase
                    .from('therapist_headset_map')
                    .select('headset_serial_number')
                    .eq('therapist_id', user.id);

                if (mapError) throw mapError;
                if (!mappings || mappings.length === 0) {
                    setSessions([]);
                    return;
                }

                if (mapError) throw mapError;
                const therapistSerials = mappings.map(m => m.headset_serial_number);
                // Extract user role (assuming it's stored in user_metadata)
                const role = user.user_metadata?.role || 'clinician';
                setUserRole(role);

                // We must include 'therapist_headset_map!inner(therapist_id)' inside the quotes!
                const { data: sessionList, error: fetchError } = await supabase
                    .from('sessions')
                    .select(`
                        session_id, 
                        headset_serial_number,
                        session_timestamp,
                        patient_id,
                        config_id,

                        patients(
                            first_name,
                            surname
                        ),

                        motion_data (
                            timestamp_delta,
                            acc_x,
                            acc_y,
                            acc_z,
                            vel_x,
                            vel_y,
                            vel_z,
                            pos_x,
                            pos_y,
                            pos_z,
                            ang_acc_x,
                            ang_acc_y,
                            ang_acc_z,
                            ang_vel_x,
                            ang_vel_y,
                            ang_vel_z,
                            ang_x,
                            ang_y,
                            ang_z
                        )

                    `)
                    .in('headset_serial_number', therapistSerials);

                if (fetchError) throw fetchError;

                // Cast our data over to our state hook array
                setSessions((sessionList as unknown as Session[]) || []);

            } catch (error: any) {
                console.error('Error fetching data: ', error);
                setErrorMessage(error.message || 'Failed to load headsets');
            } finally {
                setIsLoading(false);
            }
        }

        retrieveSessions();
    }, []); // Added the empty dependency array to prevent the infinite loop!

    if (isLoading) return <div>Loading diagnostic metrics...</div>;
    if (errorMessage) return <div>Error! {errorMessage}</div>;


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
            <div className="flex flex-col gap-4 mx-auto">
                <h2 className="text-center font-bold text-xl  text-zinc-800 mb-2">
                    Graph Filters
                </h2>
                
                <div className="justify-center items-center mx-auto">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex justify-center items-center text-center rounded h-8 w-48 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700 transition-colors"
                    >
                        Select or Filter Sessions
                    </button>
                    <select 
                        value={activeParameter} 
                        onChange={(e) => setActiveParameter(e.target.value as MetricParameter)}
                        className="p-2 border border-zinc-200 rounded-lg bg-white text-sm text-zinc-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                        >
                        {METRIC_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                            {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <AnalysisModal
                    isOpen = {isModalOpen}
                    onClose = {() => setIsModalOpen(false)}
                    sessionList={sessions}
                    selectedIds={selectedSessionIds}
                    onToggleSession={handleToggleSession}
                    updateSessions={handleSubmitSelection}
                />                   
            </div>
            <div className="flex w-full justify-center items-center">
                <div className="w-256 h-128 mt-8 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="timestamp" stroke="#a1a1aa" fontSize={11} />
                            <YAxis stroke="#a1a1aa" fontSize={11} />
                            <Tooltip />
                            <Legend />

                            {sessions
                            .filter(s => selectedSessionIds.includes(s.session_id))
                            .map((session, idx) => (
                                <Line
                                key={session.session_id}
                                type="monotone"
                                dataKey={session.session_id} // Points directly to the key path inside chartData
                                name={session.patients?.first_name || `Session ${session.session_id.slice(0,4)}`} // Clean Legend Labels
                                stroke={lineColors[idx % lineColors.length]}
                                strokeWidth={2}
                                dot={false} // Hides cluttering coordinate anchor dots for smoother presentation
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="flex">
                <button className="">
                    Average All Selected Sessions
                </button>
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