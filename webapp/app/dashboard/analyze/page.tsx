"use client"
import { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link"
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import AnalysisModal from './_components/AnalysisModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TEAMP_FILTERS }from './_components/ParameterForm';
import { ThemeToggle } from '@/components/ui/themeButton';
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";

//very long session interface, is this why everything is running slowly? 
export interface Session {
    session_id: string;
    headset_serial_number: string;
    patient_id?: string;   
    config_id?: string;   
    session_timestamp?: string;
    motion_data: MotionDataPoint[];

    min_acc_x?: number;
    min_acc_y?: number;
    min_acc_z?: number;
    max_acc_x?: number;
    max_acc_y?: number;
    max_acc_z?: number;
    mean_acc_x?: number;
    mean_acc_y?: number;
    mean_acc_z?: number;

    min_vel_x?: number;
    min_vel_y?: number;
    min_vel_z?: number;
    max_vel_x?: number;
    max_vel_y?: number;
    max_vel_z?: number;
    mean_vel_x?: number;
    mean_vel_y?: number;
    mean_vel_z?: number;

    min_pos_x?: number;
    min_pos_y?: number;
    min_pos_z?: number;
    max_pos_x?: number;
    max_pos_y?: number;
    max_pos_z?: number;
    mean_pos_x?: number;
    mean_pos_y?: number;
    mean_pos_z?: number;

    min_ang_acc_x?: number;
    min_ang_acc_y?: number;
    min_ang_acc_z?: number;
    max_ang_acc_x?: number;
    max_ang_acc_y?: number;
    max_ang_acc_z?: number;
    mean_ang_acc_x?: number;
    mean_ang_acc_y?: number;
    mean_ang_acc_z?: number;

    min_ang_vel_x?: number;
    min_ang_vel_y?: number;
    min_ang_vel_z?: number;
    max_ang_vel_x?: number;
    max_ang_vel_y?: number;
    max_ang_vel_z?: number;
    mean_ang_vel_x?: number;
    mean_ang_vel_y?: number;
    mean_ang_vel_z?: number;

    min_ang_x?: number;
    min_ang_y?: number;
    min_ang_z?: number;
    max_ang_x?: number;
    max_ang_y?: number;
    max_ang_z?: number;
    mean_ang_x?: number;
    mean_ang_y?: number;
    mean_ang_z?: number;

    min_shoot_time?: number;
    max_shoot_time?: number;
    mean_shoot_time?: number;
    min_reach_time?: number;
    max_reach_time?: number;
    mean_reach_time?: number;

    min_center_to_left?: number;
    max_center_to_left?: number;
    mean_center_to_left?: number;
    min_center_to_right?: number;
    max_center_to_right?: number;
    mean_center_to_right?: number;
    min_left_to_center?: number;
    max_left_to_center?: number;
    mean_left_to_center?: number;
    min_right_to_center?: number;
    max_right_to_center?: number;
    mean_right_to_center?: number;

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

interface CohortMetric{
    metric_name: string;
    metric_value: number;
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

export default function AnalyzingPage() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const [committedSessionIds, setCommittedSessionIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    
    const supabase = createClient();
    const showAdvancedMetrics = userRole === 'researcher'; //well we did not implement this quite yet
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAverage, setIsAverage] = useState<boolean>(false);

    const [activeParameter, setActiveParameter] = useState<MetricParameter>('acc_x');

    const { resolvedTheme } = useTheme(); // fetches theme
    const [mounted, setMounted] = useState(false);

    //theme and color palettes, feel free to play around!
    const isDark = mounted && resolvedTheme === "dark";
    const lineColors = isDark
    ? ["#2dd4bf", "#f43f5e", "#fbbf24", "#a855f7", "#38bdf8"] 
    : ["#0d9488", "#be123c", "#d97706", "#7e22ce", "#0284c7"];

    const gridColor = isDark ? "#27272a" : "#f4f4f5"; 
    const axisColor = isDark ? "#f4f4f5" : "#27272a"; 
    const avgLineColor = isDark ? "#f43f5e" : "#be123c";

    const [chartData, setChartData] = useState<any[]>([]);
    const [summaryMetrics, setSummaryMetrics] = useState<CohortMetric[]>([]);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);


    function generateChartData(
        sessions: Session[],
        selectedSessionIds: string[],
        activeParameter: MetricParameter
    ): any[] {
        //filter to only selected sessions
        const activeSessions = sessions.filter(s => selectedSessionIds.includes(s.session_id));
        if (activeSessions.length === 0) return [];

        // gather the timestamps
        const allTimestamps = new Set<number>();
        activeSessions.forEach(session => {
            session.motion_data?.forEach(point => {
                if (point.timestamp_delta !== undefined) {
                    allTimestamps.add(point.timestamp_delta);
                }
            });
        });

        // sort all the timestamps
        const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

        //put all sessions motion data of one timestamp together
        return sortedTimestamps.map((timeNumber) => {
            const dataRow: any = { timestamp: timeNumber };
            let sum = 0;
            let count = 0;

            activeSessions.forEach((session) => {
                //match sensor point, allow a margin
                const matchingPoint = session.motion_data?.find(
                    (point) => Math.abs(point.timestamp_delta - timeNumber) < 0.001
                );

                if (matchingPoint && matchingPoint[activeParameter] !== undefined) {
                    const val = Number(matchingPoint[activeParameter]);
                    
                    //key the sensor metric directly to the unique session ID
                    dataRow[session.session_id] = val;
                    
                    sum += val;
                    count++;
                }
            });

            //reserve average key for when the average line is toggled
            dataRow.average = count > 0 ? sum / count : 0;

            return dataRow;
        });
    }

    const [savedFilterStates, setSavedFilterStates] = useState<Record<string, any>>(() => {
        return TEAMP_FILTERS.reduce((acc, filter) => {
        if (filter.type === 'range') {
            acc[filter.id] = [filter.minLimit, filter.maxLimit];
        } else if (filter.type === 'select') {
            acc[filter.id] = []; //no filters
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
        const parameter = paramOverride || activeParameter;
        const finalizedSelections = selectedSessionIds;

        setCommittedSessionIds(finalizedSelections);
        setIsModalOpen(false);

        const freshData = generateChartData(sessions, finalizedSelections, parameter);
        setChartData(freshData);
    };

    const handleApplyFilters = async (filterStates: Record<string, any>) => {
        setIsLoading(true);
        try {
            setSavedFilterStates(filterStates);
            //select data we'll need with the selected filters
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

            //handle parameters that use ranges
            Object.entries(filterStates).forEach(([id, value]) => {
                //skip parameters that don't use ranges
                if (['sex', 'test_name', 'cursor_trail', 'test_audio'].includes(id)) return;
                
                //safely using minVal and maxVal now that we know what is happening
                const [minVal, maxVal] = value as [number, number];

                //where to find the values of these parameters (patients or test_settings table)
                if (['age', 'bmi', 'height', 'weight'].includes(id)) {
                    query = query.gte(`patients.${id}`, minVal).lte(`patients.${id}`, maxVal);
                } else {
                    query = query.gte(`test_settings.${id}`, minVal).lte(`test_settings.${id}`, maxVal);
                }
            });

            //handle the other parameters
            if (filterStates.sex && filterStates.sex.length > 0) {
                query = query.in('patients.sex', filterStates.sex);
            }
            
            if (filterStates.test_name && filterStates.test_name.length > 0) {
                query = query.in('test_settings.test_name', filterStates.test_name);
            }

            //handle the parameters that deal with booleans
            if (filterStates.cursor_trail && filterStates.cursor_trail.length > 0) {
                //turn strings into boolean values
                const booleanValues = filterStates.cursor_trail.map((val: string) => val === 'true');
                query = query.in('test_settings.cursor_trail', booleanValues);
            }

            if (filterStates.test_audio && filterStates.test_audio.length > 0) {
                //turn strings into boolean values
                const booleanValues = filterStates.test_audio.map((val: string) => val === 'true');
                query = query.in('test_settings.test_audio', booleanValues);
            }

            const { data, error } = await query;
            if (error) throw error;

            // turn database rows to session interface
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

                //retrieve all headsets that work
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
                //get user role, and have a placeholder if necessary
                const role = user.user_metadata?.role || 'clinician';
                setUserRole(role);

                //select all information needed form the supabase
                //this might be the reason why it's so slow to load the graphs
                const { data: sessionList, error: fetchError } = await supabase
                .from('sessions')
                .select(`
                    session_id, 
                    headset_serial_number,
                    session_timestamp,
                    patient_id,
                    config_id,

                    min_acc_x, min_acc_y, min_acc_z,
                    max_acc_x, max_acc_y, max_acc_z,
                    mean_acc_x, mean_acc_y, mean_acc_z,

                    min_vel_x, min_vel_y, min_vel_z,
                    max_vel_x, max_vel_y, max_vel_z,
                    mean_vel_x, mean_vel_y, mean_vel_z,

                    min_pos_x, min_pos_y, min_pos_z,
                    max_pos_x, max_pos_y, max_pos_z,
                    mean_pos_x, mean_pos_y, mean_pos_z,

                    min_ang_acc_x, min_ang_acc_y, min_ang_acc_z,
                    max_ang_acc_x, max_ang_acc_y, max_ang_acc_z,
                    mean_ang_acc_x, mean_ang_acc_y, mean_ang_acc_z,

                    min_ang_vel_x, min_ang_vel_y, min_ang_vel_z,
                    max_ang_vel_x, max_ang_vel_y, max_ang_vel_z,
                    mean_ang_vel_x, mean_ang_vel_y, mean_ang_vel_z,

                    min_ang_x, min_ang_y, min_ang_z,
                    max_ang_x, max_ang_y, max_ang_z,
                    mean_ang_x, mean_ang_y, mean_ang_z,

                    min_shoot_time, max_shoot_time, mean_shoot_time,
                    min_reach_time, max_reach_time, mean_reach_time,

                    min_center_to_left, max_center_to_left, mean_center_to_left,
                    min_center_to_right, max_center_to_right, mean_center_to_right,
                    min_left_to_center, max_left_to_center, mean_left_to_center,
                    min_right_to_center, max_right_to_center, mean_right_to_center,

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

                //take all this data and bring it to the state variable (later we call setSessions)
                const parsedList: Session[] = (sessionList || []).map((row: any) => {
                const { headsets, patients, motion_data, ...metrics } = row;

                return {
                    ...metrics,
                    
                    session_id: row.session_id,
                    headset_serial_number: row.headset_serial_number,
                    patient_id: row.patient_id,
                    config_id: row.config_id,
                    session_timestamp: row.session_timestamp,
                    motion_data: motion_data || [],
                    
                    // relations with fallbacks, in case we cannot find what we need
                    headsets: headsets
                        ? {
                            headset_serial_number: headsets.headset_serial_number,
                            therapist_headset_map: headsets.therapist_headset_map || []
                        }
                        : null,

                    patients: patients 
                        ? {
                            first_name: patients.first_name,
                            surname: patients.surname
                        }
                        : null
                };
            });

                setSessions(parsedList);

            } catch (error: any) {
                console.error('Error fetching data: ', error);
                setErrorMessage(error.message || 'Failed to load headsets');
            } finally {
                setIsLoading(false);
            }
        }

        retrieveSessions();
    }, []);

    useEffect(() => {
        //fetch the summary for the "overall statistics"
        const fetchCohortSummary = async () => {
            if (!committedSessionIds || committedSessionIds.length === 0) {
                setSummaryMetrics([]);
                return;
            }

            setIsLoadingSummary(true);
            try {
                const { data, error } = await supabase
                    .rpc('get_cohort_summary', { 
                        target_session_ids: committedSessionIds 
                    });

                if (error) throw error;
                setSummaryMetrics(data || []);
            } catch (err) {
                console.error("Failed fetching database summary tracking matrix:", err);
            } finally {
                setIsLoadingSummary(false);
            }
        };

        fetchCohortSummary();
    }, [committedSessionIds]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (isLoading) return <div className="justify-center items-center text-center mx-auto">Loading diagnostic metrics...</div>;
    if (errorMessage) return <div>Error! {errorMessage}</div>;


    return(
        <div className="flex flex-col">
            <div className="justify-center items-center mb-10">
                <Link href="/dashboard">
                    <button className="bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 flex items-center justify-center rounded-md h-8 px-3 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                        Return
                    </button>
                </Link>
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>
                <h1 className="text-center text-zinc-700 dark:text-zinc-100 text-5xl font-bold">
                    Analyzer Application
                </h1>
            </div>
            <div className="flex flex-col gap-4 mx-auto w-full ">
                <h2 className="text-center font-bold text-xl justify-center items-center mx-auto text-zinc-800 dark:text-zinc-100 mb-2">
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
                            className="form-input"
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
                <Card className="bg-white dark:bg-black w-full p-6 mt-4">
                    {/* the graph */}
                    <div className="w-256 h-128 mt-8 mb-4 pr-20">
                        <ResponsiveContainer key={resolvedTheme} width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis dataKey="timestamp" stroke={axisColor} fontSize={11} />
                                <YAxis stroke={axisColor} fontSize={11} />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: isDark ? "#18181b" : "#ffffff",
                                        borderColor: isDark ? "#27272a" : "#e4e4e7",
                                        color: isDark ? "#f4f4f5" : "#18181b",
                                        borderRadius: "0.375rem"
                                    }}
                                />
                                <Legend wrapperStyle={{ color: isDark ? "#f4f4f5" : "#18181b" }} />
                                {isAverage ? (
                                    chartData.length > 0 && (
                                        <Line
                                        type="monotone"
                                        dataKey="average" 
                                        stroke={avgLineColor}    
                                        strokeWidth={3}  
                                        name="Average Line"
                                        dot={false}
                                        />
                                    )
                                ) : (
                                    sessions
                                    .filter(s => committedSessionIds.includes(s.session_id))
                                    .map((session, idx) => (
                                        <Line
                                        key={session.session_id}
                                        type="monotone"
                                        dataKey={session.session_id} // points directly to the key path inside chartData
                                        name={session.patients?.first_name || `Session ${session.session_id.slice(0,4)}`} // legend labels
                                        stroke={lineColors[idx % lineColors.length]}
                                        strokeWidth={2}
                                        dot={false}
                                        />
                                    ))
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center items-center mb-8">
                        <button onClick={() => setIsAverage(!isAverage)} className="rounded h-8 w-64 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700">
                        {isAverage ? 'Reset to Individual Sessions' : 'Average All Selected Sessions'}
                        </button>
                    </div>
                </Card>
                    <div className="flex flex-col w-full justify-center items-center">
                        <Card className="bg-white dark:bg-black p-6 mt-6">
                            <h2 className="text-center text-zinc-700 dark:text-zinc-100 text-3xl font-bold mb-4 underline">
                                Overall Statistics:
                            </h2>
                            {isLoadingSummary ? (
                                <p className="text-xs text-zinc-400 dark:text-zinc-100 italic text-center py-4">Calculating data balances...</p>
                            ) : summaryMetrics.length > 0 ? (
                                <div className="grid grid-cols-3 gap-x-24 w-200 gap-y-1">
                                {summaryMetrics.map((item) => (
                                    <p key={item.metric_name} className="text-xs text-zinc-600 dark:text-zinc-100 flex justify-between py-1">
                                    <span className="font-medium text-zinc-500 dark:text-zinc-100 capitalize">
                                        {item.metric_name.replace(/_/g, ' ')}:
                                    </span>
                                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                        {item.metric_value !== null ? item.metric_value.toFixed(3) : "N/A"}
                                    </span>
                                    </p>
                                ))}
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-400 dark:text-zinc-100 text-center py-4">No data sessions selected</p>
                            )}
                        </Card>
                    </div>
            </div>
        </div>
    )
}