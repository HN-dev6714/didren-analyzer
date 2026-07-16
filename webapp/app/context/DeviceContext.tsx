'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

// Keep your interface clean and accurate
interface Device {
  headset_serial: string;
  code: string;
  expiration: string;
  nickname: string;
}

interface DeviceContextType {
  devices: Device[];
  isLoading: boolean;
  errorMessage: string;
  addDevice: (newDevice: Device) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const supabase = createClient();

  // The useEffect now lives here globally!
  useEffect(() => {
    async function fetchHeadsetData() {
      try {
        setIsLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!user) return;
        if (userError) throw userError;

        const { data: mappingList, error: fetchError } = await supabase
        .from('therapist_headset_map')
        .select(`
          headset_serial_number,
          headsets (
            nickname
          )
        `)
        .eq('therapist_id', user.id);

        if (fetchError) throw fetchError;

        const formattedDevices = (mappingList || []).map(item => ({
          headset_serial: item.headset_serial_number,
          code: 'PAIRED',
          expiration: 'Permanent',
          nickname: 'Placeholder'
        }));

        setDevices(formattedDevices);
      } catch (error: any) {
        console.error('Error fetching data globally: ', error);
        setErrorMessage('Failed to load headsets');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeadsetData();
  }, []); // Empty dependency array means this runs ONCE for the whole app session

  const addDevice = async (newDevice: Device) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const { error: headsetError } = await supabase
        .from('headsets')
        .upsert({
          headset_serial_number: newDevice.headset_serial,
          nickname: newDevice.nickname,
          device_model: 'Meta Quest 3' 
        }, { onConflict: 'headset_serial_number' });

      if (headsetError) throw headsetError;

      const { error: mapError } = await supabase
        .from('therapist_headset_map')
        .upsert({
          therapist_id: user.id,
          headset_serial_number: newDevice.headset_serial
        }, { onConflict: 'therapist_id,headset_serial_number' });

      if (mapError) throw mapError;

      setDevices((prevDevices) => [...prevDevices, newDevice]);

    } catch (error: any) {
      console.error('Error persisting new device:', error);
      setErrorMessage(error.message || 'Failed to add device to the database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DeviceContext.Provider value={{ devices, isLoading, errorMessage, addDevice }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevices must be used within a DeviceProvider');
  return context;
}