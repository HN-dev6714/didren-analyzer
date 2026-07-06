"use client"
import { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link"
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import AnalysisModal from './_components/AnalysisModal'


interface Session{
    session_id: string; // or number, depending on your DB configuration
    headset_serial_number: string;
    patient_name?: string;      // Optional fields for your filters
    test_parameters?: string;   
    created_at?: string;
    // This matches the nested object structure Supabase returns for the join:
    therapist_headset_map: {
        therapist_id: string;
    }[];
}
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
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    
    const supabase = createClient();
    const showAdvancedMetrics = userRole === 'researcher';
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                        session_timestamp
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
            <div className="flex flex-col gap-4">
                <h2 className="text-center font-bold text-xl  text-zinc-800 mb-2">
                    Graph Filters
                </h2>
                    
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex justify-center items-center text-center rounded h-8 w-48 bg-teal-800 text-zinc-100 font-medium text-sm hover:bg-teal-700 transition-colors"
                >
                    Select or Filter Sessions
                </button>
                <AnalysisModal
                    isOpen = {isModalOpen}
                    onClose = {() => setIsModalOpen(false)}
                />

                    
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