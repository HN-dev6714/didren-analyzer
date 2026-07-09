"use client"
import { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link"
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import AnalysisModal from './_components/AnalysisModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TEAMP_FILTERS }from './_components/ParameterForm';


export interface Session {
    session_id: string;
    headset_serial_number: string;
    patient_id?: string;   
    config_id?: string;   
    session_timestamp?: string;
    motion_data: MotionDataPoint[];

    headsets: {
        headset_serial_number: string;
        therapist_headset_map: {
            therapist_id: string;
        }[];
    } | null;

    patients: {
        first_name: string;
        surname: string;
    } | null;
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
  { value: 'pos_z',     label: 'Position (Z-Axis)' },
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
    const [isAverage, setIsAverage] = useState<boolean>(false);

    const [activeParameter, setActiveParameter] = useState<MetricParameter>('acc_x');
    const lineColors = ['#0f766e', '#4338ca', '#b45309', '#be185d', '#1d4ed8'];

    const [chartData, setChartData] = useState<any[]>([]);

    function generateChartData(
        sessions: Session[],
        selectedSessionIds: string[],
        activeParameter: MetricParameter // Or your specific MetricParameter type
    ): any[] {
        // 1. Filter down to only sessions chosen by the therapist checkboxes
        const activeSessions = sessions.filter(s => selectedSessionIds.includes(s.session_id));
        if (activeSessions.length === 0) return [];

        // 2. Gather all unique timestamps across selected sessions to avoid index-shift drops
        const allTimestamps = new Set<number>();
        activeSessions.forEach(session => {
            session.motion_data?.forEach(point => {
                if (point.timestamp_delta !== undefined) {
                    allTimestamps.add(point.timestamp_delta);
                }
            });
        });

        // 3. Sort chronologically left-to-right
        const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

        // 4. Map timestamps into unified cross-session snapshots
        return sortedTimestamps.map((timeNumber) => {
            const dataRow: any = { timestamp: timeNumber };
            let sum = 0;
            let count = 0;

            activeSessions.forEach((session) => {
                // Find sensor point matching this timestamp with a tiny floating-point margin
                const matchingPoint = session.motion_data?.find(
                    (point) => Math.abs(point.timestamp_delta - timeNumber) < 0.001
                );

                if (matchingPoint && matchingPoint[activeParameter] !== undefined) {
                    const val = Number(matchingPoint[activeParameter]);
                    
                    // Key the sensor metric directly to the unique session ID
                    dataRow[session.session_id] = val;
                    
                    sum += val;
                    count++;
                }
            });

            // Add a baseline average key in case the user toggles the global average line
            dataRow.average = count > 0 ? sum / count : 0;

            return dataRow;
        });
    }

    const [savedFilterStates, setSavedFilterStates] = useState<Record<string, any>>(() => {
        return TEAMP_FILTERS.reduce((acc, filter) => {
        if (filter.type === 'range') {
            acc[filter.id] = [filter.minLimit, filter.maxLimit];
        } else if (filter.type === 'select') {
            acc[filter.id] = []; // Empty array means "everything selected/no constraint"
        }
      return acc;
        }, {} as Record<string, any >);
    });

    const handleToggleSession = (sessionId: string) => {
        setSelectedSessionIds((prevSelected) =>
        prevSelected.includes(sessionId)
            ? prevSelected.filter((id) => id !== sessionId)
            : [...prevSelected, sessionId] 
        );
    };

    const handleSubmitSelection = (paramOverride?: MetricParameter) => {
        console.log("Sending these IDs to Recharts:", selectedSessionIds);
        setIsModalOpen(false); //more gracefully perhaps? Transition? 

        const parameter = paramOverride || activeParameter;

        console.log("Received Override Argument:", paramOverride);
        console.log("Fallback State Value:      ", activeParameter);
        console.log("FINAL RESOLVED PARAMETER:  ", `"${parameter}"`);
        
        const freshData = generateChartData(sessions, selectedSessionIds, parameter);
        setChartData(freshData);
    };

    const handleApplyFilters = async (filterStates: Record<string, any>) => {
        setIsLoading(true);
        try {
            setSavedFilterStates(filterStates);

            let query = supabase
                .from('sessions') 
                .select(`
                    session_id,
                    headset_serial_number,
                    patient_id,
                    config_id,
                    session_timestamp,
                    motion_data (
                        timestamp_delta, acc_x, acc_y, acc_z, vel_x, vel_y, vel_z,
                        pos_x, pos_y, pos_z, ang_acc_x, ang_acc_y, ang_acc_z,
                        ang_vel_x, ang_vel_y, ang_vel_z, ang_x, ang_y, ang_z
                    ),
                    patients!inner ( first_name, surname, sex, age, height, weight, bmi ),
                    test_settings!inner ( angle, distance, space, accuracy, radius, target_height, size, cycles, validation_time, test_name, cursor_trail, test_audio ),
                    headsets!inner (
                        headset_serial_number,
                        therapist_headset_map ( therapist_id )
                    )
                `);

            // Step 1: Handle Numerical Ranges via Safe Destructuring
            Object.entries(filterStates).forEach(([id, value]) => {
                // Skip non-range parameters inside the loop
                if (['sex', 'test_name', 'cursor_trail', 'test_audio'].includes(id)) return;
                
                // At this point, TS/JS safely knows value is a range tuple: [minVal, maxVal]
                const [minVal, maxVal] = value as [number, number];

                if (['age', 'bmi', 'height', 'weight'].includes(id)) {
                    query = query.gte(`patients.${id}`, minVal).lte(`patients.${id}`, maxVal);
                } else {
                    query = query.gte(`test_settings.${id}`, minVal).lte(`test_settings.${id}`, maxVal);
                }
            });

            // Step 2: Handle Polymorphic Selection Arrays (SQL "IN" matching)
            // Only filter if the user selected at least one option. If empty, include all.
            if (filterStates.sex && filterStates.sex.length > 0) {
                query = query.in('patients.sex', filterStates.sex);
            }
            
            if (filterStates.test_name && filterStates.test_name.length > 0) {
                // Fixed table path prefix wrapper context matcher matching your .select() layout
                query = query.in('test_settings.test_name', filterStates.test_name);
            }

            // Step 3: Handle Boolean Constraint Matching
            if (filterStates.cursor_trail && filterStates.cursor_trail.length > 0) {
                // Convert string array e.g., ['true'] -> [true]
                const booleanValues = filterStates.cursor_trail.map((val: string) => val === 'true');
                query = query.in('test_settings.cursor_trail', booleanValues);
            }

            if (filterStates.test_audio && filterStates.test_audio.length > 0) {
                // Convert string array e.g., ['true', 'false'] -> [true, false]
                const booleanValues = filterStates.test_audio.map((val: string) => val === 'true');
                query = query.in('test_settings.test_audio', booleanValues);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Transform raw database rows to fit your strict Session format
            const formattedSessions: Session[] = (data || []).map((row: any) => ({
                session_id: row.session_id,
                headset_serial_number: row.headset_serial_number,
                patient_id: row.patient_id,
                config_id: row.config_id,
                session_timestamp: row.session_timestamp,
                motion_data: row.motion_data || [],
                
                headsets: row.headsets
                    ? {
                        headset_serial_number: row.headsets.headset_serial_number,
                        therapist_headset_map: row.headsets.therapist_headset_map || []
                    }
                    : null,

                patients: row.patients 
                    ? {
                        first_name: row.patients.first_name,
                        surname: row.patients.surname
                    }
                    : null
            }));

            setSelectedSessionIds([]);
            setSessions(formattedSessions);
                        
        } catch (err) {
            console.error("Supabase pipeline execution failed:", err);
        } finally {
            setIsLoading(false);
        }
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

                    patients (
                        first_name,
                        surname
                    ),

                    headsets!inner (
                        headset_serial_number,
                        therapist_headset_map!inner ( 
                            therapist_id,
                            headset_serial_number 
                        )
                    ),

                    motion_data (
                        timestamp_delta, acc_x, acc_y, acc_z, vel_x, vel_y, vel_z,
                        pos_x, pos_y, pos_z, ang_acc_x, ang_acc_y, ang_acc_z,
                        ang_vel_x, ang_vel_y, ang_vel_z, ang_x, ang_y, ang_z
                    )
                `)
                .in('headsets.therapist_headset_map.headset_serial_number', therapistSerials);

                if (fetchError) throw fetchError;

                // Cast our data over to our state hook array
                const parsedList: Session[] = (sessionList || []).map((row: any) => ({
                    session_id: row.session_id,
                    headset_serial_number: row.headset_serial_number,
                    patient_id: row.patient_id,
                    config_id: row.config_id,
                    session_timestamp: row.session_timestamp,
                    motion_data: row.motion_data || [],
                    
                    headsets: row.headsets
                    ? {
                        headset_serial_number: row.headsets.headset_serial_number,
                        therapist_headset_map: row.headsets.therapist_headset_map || []
                    }
                    : null,

                    patients: row.patients 
                        ? {
                            first_name: row.patients.first_name,
                            surname: row.patients.surname,
                            therapist_headset_map: row.patients.therapist_headset_map || []
                        }
                        : null
                }));

                setSessions(parsedList);

            } catch (error: any) {
                console.error('Error fetching data: ', error);
                setErrorMessage(error.message || 'Failed to load headsets');
            } finally {
                setIsLoading(false);
            }
        }

        retrieveSessions();
    }, []); // Added the empty dependency array to prevent the infinite loop!

    if (isLoading) return <div className="justify-center items-center text-center mx-auto">Loading diagnostic metrics...</div>;
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
            <div className="flex flex-col gap-4 mx-auto w-full ">
                <h2 className="text-center font-bold text-xl justify-center items-center mx-auto text-zinc-800 mb-2">
                    Graph Filters
                </h2>
                
                <div className=" flex w-full justify-center items-center mx-auto gap-2">
                    <div>
                        <select 
                            value={activeParameter} 
                            onChange={(e) => {
                                const nextParam = e.target.value as MetricParameter;                            
                                setActiveParameter(nextParam);                            
                                handleSubmitSelection(nextParam);
                            }}
                            className="justify-center p-2 items-center mx-auto border border-zinc-200 rounded-lg bg-white text-sm text-zinc-700 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                            {METRIC_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex justify-center items-center text-center mx-auto rounded h-8 w-48 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700 transition-colors"
                        >
                            Select or Filter Sessions
                        </button>
                    </div>
                </div>
                <AnalysisModal
                    isOpen = {isModalOpen}
                    onClose = {() => setIsModalOpen(false)}
                    sessionList={sessions}
                    selectedIds={selectedSessionIds}
                    onToggleSession={handleToggleSession}
                    updateSessions={() => handleSubmitSelection()}
                    onSubmitFilters={handleApplyFilters}
                    currentFilters={savedFilterStates}
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
                            {isAverage ? (
                                chartData.length > 0 && (
                                    <Line
                                    type="monotone"
                                    dataKey="average"           // Pulls from dataRow.average
                                    stroke="#be123c"             // Distinct deep rose color
                                    strokeWidth={3}              // Solid presence
                                    name="Average Line"
                                    dot={false}
                                    />
                                )
                            ) : (
                                sessions
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
                                ))
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="flex justify-center items-center mb-10">
                <button onClick={() => setIsAverage(!isAverage)} className="rounded h-8 w-64 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700">
                   {isAverage ? 'Reset to Individual Sessions' : 'Average All Selected Sessions'}
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