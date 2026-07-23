'use client'

import { useState } from 'react';
import { Session } from '../page';
import DateFormatter from '@/components/ui/dateformatter'

interface Props {
  sessionList: Session[];
  selectedIds: string[];
  onToggleSession: (id: string) => void;
  updateSessions: () => void;
}


export default function SessionList({ sessionList, selectedIds, onToggleSession, updateSessions}: Props) {

    const [isAllSelected, setIsAllSelected] = useState(false);

    const selectAllSessions = () => {
        for(let i = 0; i < sessionList.length; i++){
            if(!selectedIds.includes(sessionList[i].session_id)){
                onToggleSession(sessionList[i].session_id)
            }
        }
        setIsAllSelected(true);
    }

    const deselectAllSessions = () => {
        for(let i = 0; i < sessionList.length; i++){
            if(selectedIds.includes(sessionList[i].session_id)){
                onToggleSession(sessionList[i].session_id)
            }
        }
        setIsAllSelected(false);
    }

    return (
        <div className="space-y-2">
            <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-100 mb-2 text-center">Select Sessions:</h2>
            
            {sessionList.map((session) => {
            // Check if this specific item is inside the active selection array
            const isSelected = selectedIds.includes(session.session_id);

            return (
                <button
                key={session.session_id}
                type="button"
                onClick={() => onToggleSession(session.session_id)} 
                className={`w-full p-4 rounded-xl border text-left transition-all flex justify-between items-center ${
                    isSelected
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600 text-zinc-200'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-50'
                }`}
                >
                <div>
                    <p>{session.patients?.first_name || 'we don\'t know'} {session.patients?.surname || ''} at <DateFormatter isoString={session.session_timestamp?? ''} showTime={true} /> and the ID is probably {session.session_id}</p>
                </div>

                {/* Visual Checkbox Indicator */}
                <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-zinc-300 bg-white'
                }`}>
                    {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    )}
                </div>
                </button>
            );
            })}

            <div className="flex justify-center items-center">
                <button onClick={updateSessions} className="flex justify-center items-center text-center rounded h-8 w-48 border border-teal-600 mx-auto hover:bg-teal-700 bg-teal-600 dark:text-zinc-100 text-zinc-700">Submit Sessions</button>

                <button onClick={isAllSelected ? deselectAllSessions : selectAllSessions} className="flex justify-center items-center text-center rounded h-8 w-48 border border-teal-600 mx-auto hover:bg-teal-700 bg-teal-600 dark:text-zinc-100 text-zinc-700">
                    {isAllSelected ? 'Deselect All Sessions' : 'Select All Sessions'}
                </button>
            </div>
        </div>
    );
}