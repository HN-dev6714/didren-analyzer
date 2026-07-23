'use client';

import React from 'react';
import ParameterForm from './ParameterForm';
import SessionList from './SessionList';
import { Session } from '../page';

export interface AnalysisModalProps{
    isOpen: boolean;
    onClose: () => void;
    sessionList: Session[];
    selectedIds: string[];
    onToggleSession: (id: string) => void;
    updateSessions: () => void;
    onSubmitFilters: (filters: Record<string, [number, number]>) => void;
    currentFilters: Record<string, [number, number]>;
}


export default function AnalysisModal({isOpen, onClose, sessionList, selectedIds, onToggleSession, updateSessions, onSubmitFilters, currentFilters}: AnalysisModalProps){
    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">    
            <div className="bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Filter & Select Sessions</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-100">Configure parameters to narrow down metrics data sets.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-300 rounded-lg transition-colors font-medium text-sm"
                    >
                        Close
                    </button>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                
                <div className="md:col-span-5 p-6 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/50">
                    <ParameterForm 
                        onSubmitFilters={onSubmitFilters}
                        currentFilters={currentFilters}
                    />
                </div>

                <div className="md:col-span-7 p-6 overflow-y-auto bg-white dark:bg-black">
                    <SessionList 
                        sessionList={sessionList}
                        selectedIds={selectedIds}
                        onToggleSession={onToggleSession}
                        updateSessions= {updateSessions}
                    />
                </div>

                </div>

            </div>
    </div>
    );
}