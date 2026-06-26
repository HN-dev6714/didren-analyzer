'use client'

import { useDevices } from '@/app/context/DeviceContext';


export default function sessionModal(){

    const { devices, isLoading } = useDevices();
    //the variable devices must have all the headsets associated with the user

    if(isLoading) return (<div>Loading devices...</div>);

    return (
        <div className="flex">
            <div className="flex flex-col">
                Filters
            </div>
            <div className="flex flex-col">
                Sessions
                <select>
                    {devices.map(d => (
                        <option key={d.headset_serial} value={d.headset_serial}>{d.headset_serial}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}