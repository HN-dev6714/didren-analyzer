'use client';

import { useState } from 'react';
import { useDevices } from '@/app/context/DeviceContext';
import { createClient } from '@/utils/supabase/client';

export function AddHeadsetForm() {

    const [pinInput, setPinInput] = useState('');
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string}>({ type: null, text: ''});
    const [isLoading, setIsLoading] = useState(false);
    const { addDevice } = useDevices();
    const [headsetName, setHeadsetName] = useState('');

    const supabase = createClient();

    const VerifyCode = async() => {
        //verifies if code entered matches any of the codes in the database
        //is this function supposed to be here?
        if (pinInput.length != 6){
            setStatusMessage({ type: 'error', text: 'Please enter a valid 6-digit code'});
            return;
        }

        setIsLoading(true);
        setStatusMessage({type: null, text: ''});

        //access supabase
        //if number input matches code, link therapist and headset in the intermediary table
        //if not, return error

        try{
            //get therapist details
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error ('Authentication error. Please log in again.');

            const now = new Date();

            //look in device_codes for match and expiration time
            const { data: validCodeEntry, error: codeError } = await supabase
                .from('device_codes')
                .select('headset_serial, expiration')
                .eq('code', pinInput)
                .gt('expiration', now.toISOString())
                .maybeSingle();

                if (codeError) {
                    console.error("Database query failed:", codeError);
                } else {
                    console.log("--- Debugging Device Code Records ---");
                    console.table(validCodeEntry);
                }
            
            if (codeError || !validCodeEntry){
                setStatusMessage({ type: 'error', text: 'Invalid or expired code. Please try again.'});
                if(!validCodeEntry){
                    console.error('not valid code')
                }
                else{
                    console.error(codeError);
                }
                setIsLoading(false);
                return;
            }

            const { error: headsetUpdateError } = await supabase
                .from('headsets')
                .update({ nickname: headsetName.trim() })
                .eq('headset_serial_number', validCodeEntry.headset_serial); 
            if (headsetUpdateError) {
                throw new Error(`Failed to update headset name: ${headsetUpdateError.message}`);
            }

            //link therapist to headset
            const { error: linkError } = await supabase
                .from('therapist_headset_map')
                .insert({
                    therapist_id: user.id,
                    headset_serial_number: validCodeEntry.headset_serial
                });

            if (linkError) {
                if(linkError.code === '23505'){
                    setStatusMessage({ type: 'error', text: 'This headset is already linked to an account.' });
                } else{
                    throw linkError;
                }
                setIsLoading(false);
                return;
            }

            addDevice({
                headset_serial: validCodeEntry.headset_serial,
                code: 'PAIRED',
                expiration: 'Permanent',
                nickname: headsetName
            });
            
            await supabase
                .from('device_codes')
                .delete()
                .eq('code', pinInput);

            //success! Please, type in headset name
            setStatusMessage({ type: 'success', text: 'Headset successfully paired and stored!'});
            setPinInput('');

        } catch(error: any){
            console.error('Error! ', error);
            setStatusMessage({ type: 'error', text: error.message || 'An unexpected error occurred.'});
        } finally{
            setIsLoading(false);
        }

    }


    return (
    <div className="flex flex-col gap-4 w-full">
        <div>
            <h1 className="text-xl font-bold text-teal-700 dark:text-teal-400 text-center">Pair New VR Headset</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-200 mt-1 text-center">
                Enter the code shown on the VR Headset Screen:
            </p>
        </div>

        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200 ">Pairing Code</label>
            <input 
                type="text" 
                placeholder="e.g. 123456" 
                maxLength={6}
                value = {pinInput}
                disabled = {isLoading}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="text-zinc-900 dark:text-zinc-300 h-10 bg-zinc-200 dark:bg-zinc-800 border border-zinc-800 rounded-lg px-3 text-sm tracking-widest uppercase text-center font-mono focus:outline-none focus:border-teal-500"
            />
        </div>

        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200 ">Headset Name</label>
            <input 
                type="text" 
                placeholder="E.G. Headset 1" 
                maxLength={30}
                value = {headsetName}
                disabled = {isLoading}
                onChange={(e) => setHeadsetName(e.target.value)}
                className="text-zinc-900 dark:text-zinc-300 h-10 bg-zinc-200 dark:bg-zinc-800 border border-zinc-800 rounded-lg px-3 text-sm tracking-widest text-center font-mono focus:outline-none focus:border-teal-500"
            />
        </div>

        {statusMessage.type && (
            <div className={`text-xs text-center font-medium p-2 rounded ${
                    statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                {statusMessage.text}
            </div>
        )}
        <button onClick = {VerifyCode} disabled={isLoading} className="w-full h-10 bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm rounded-lg transition-colors mt-2">
            Verify and Link Device
        </button>
    </div>
    );
}