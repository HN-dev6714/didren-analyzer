"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

//socket context interface and its components needed
interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    //establish the connection inside useEffect so it only executes on the client browser
    const ws = new WebSocket('ws://localhost:8080?role=therapist&id=TEST_THERAPIST_123');

    //assign the proper functions to the web socket
    ws.onopen = () => {
      console.log("WebSocket connection pipeline successfully secured!");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      console.log("Global message packet received: ", event.data);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected.");
      setIsConnected(false);
    };

    setSocket(ws);

    //clean up connection if the user closes the app tab
    return () => {
      ws.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

//build a hook so pages can pull the connection safely
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a nested SocketProvider layout tree');
  }
  return context;
}