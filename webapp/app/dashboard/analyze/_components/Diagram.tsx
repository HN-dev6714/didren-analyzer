'use client';

import { Card } from "@/components/ui/card";
import Diagram from "@/public/images/diagram.png";
import Image from "next/image";

export interface DiagramProps{
    isOpen: boolean;
    onClose: () => void;
}
export default function DiagramModal ({isOpen, onClose}: DiagramProps) {

    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">    
            <div className="bg-white dark:bg-black rounded-2xl shadow-2xl max-w-5xl  flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                    <div className="text-center">
                        <h2 className=" text-lg font-bold text-zinc-800 dark:text-zinc-100">Reference Diagram</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-100"></p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-300 rounded-lg transition-colors font-medium text-sm"
                    >
                        Close
                    </button>
                </div>

                <div className="flex overflow-hidden">                    
                    <Image
                        src={Diagram}
                        alt="Diagram of VR headset and axes"
                        className="h-full w-auto object-contain"
                    />  
                </div>       
            </div>
        </div>
);
}