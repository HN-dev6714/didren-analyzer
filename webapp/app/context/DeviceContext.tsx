'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

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
  clearDevices: () => void;
}

//the device context is useful as both the testing and analyzing parts need the device information
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  //function to clear the devices array, used when logging out
  const clearDevices = () => {
    setDevices([]);
  };
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null);
      });

      return () => subscription.unsubscribe();
    }, []);

  useEffect(() => {
    //fetch all devices associated with a given userId
    //user Id may not be null
    async function fetchHeadsetData() {
      if (!userId) {
        setDevices([]);
        return;
      }
      try {
        setIsLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!user) return;
        if (userError) throw userError;

        //reference supabase for the proper information
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

        //format all devices into the variable map formattedDevices
        const formattedDevices = (mappingList || []).map(item => {
        const headsetData = Array.isArray(item.headsets) 
          ? item.headsets[0] 
          : item.headsets;

        return {
          headset_serial: item.headset_serial_number,
          code: 'PAIRED',
          expiration: 'Permanent',
          nickname: headsetData?.nickname || 'Unnamed Headset'
        };
      });
        //set these formattedDevices into the state variable stateDevices
        setDevices(formattedDevices);

      } catch (error: any) { //catch any errors
        console.error('Error fetching data globally: ', error);
        setErrorMessage('Failed to load headsets');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeadsetData();
  }, [userId]);

  //adding a device-therapist mapping to the Supabase, given a device code pairing
  const addDevice = async (newDevice: Device) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      //update or insert the headset retrieved from the device_codes and the nickname provided by users
      const { error: headsetError } = await supabase
        .from('headsets')
        .upsert({
          headset_serial_number: newDevice.headset_serial,
          nickname: newDevice.nickname,
          device_model: 'Meta Quest 3' 
        }, { onConflict: 'headset_serial_number' });

      if (headsetError) throw headsetError;

      //add a therapist mapping between the user id and the headset serial number
      const { error: mapError } = await supabase
        .from('therapist_headset_map')
        .upsert({
          therapist_id: user.id,
          headset_serial_number: newDevice.headset_serial
        }, { onConflict: 'therapist_id,headset_serial_number' });

      if (mapError) throw mapError;

      //add this device to the user's list of devices
      setDevices((prevDevices) => [...prevDevices, newDevice]);

    } catch (error: any) {
      console.error('Error persisting new device:', error);
      setErrorMessage(error.message || 'Failed to add device to the database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DeviceContext.Provider value={{ devices, isLoading, errorMessage, addDevice, clearDevices }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevices must be used within a DeviceProvider');
  return context;
}