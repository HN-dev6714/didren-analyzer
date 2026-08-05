
import { WebSocket, WebSocketServer } from 'ws';
import * as http from 'http';

interface SignalingMessage {
    targetId: string;
    action: string;
    payload: any;
}

const therapists = new Map<string, WebSocket>();
const headsets = new Map<string, WebSocket>();

const server = http.createServer();
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ server });

console.log(`[DEBUG] WebSocket engine instantiated directly on port ${PORT}`);

wss.on('connection', (socket: WebSocket, request: http.IncomingMessage) => {
    
    const urlParams = new URL(request.url || '', `http://${request.headers.host}`);
    const clientRole = urlParams.searchParams.get('role');
    const clientId = urlParams.searchParams.get('id');

    //check incoming connections URLs. If connection comes from Unity, 
    //parse serial number and run headsets.set(serial, socket);
    //if website, run therapists.set(therapistId, socket);
    
    if(clientRole === 'headset' && clientId){
        headsets.set(clientId, socket);
        console.log(`Headset Registered: ${ clientId }`);
    } else if (clientRole === 'therapist' && clientId){
        //pass Supabase JWT Access Token through connection URL parameters
        //to verify therapist identity
        therapists.set(clientId, socket);
        console.log(`Therapist Registered: ${clientId}`);
    }

    socket.on('close', ()=> {
        if (clientRole === 'headset' && clientId){
            headsets.delete(clientId);
        } else if (clientRole === 'therapist' && clientId){
            therapists.delete(clientId);
        }
        console.log(`Client disconnected: ${clientId}`);
    })

    //inside socket.on('message') listener, parse JSON payload
    socket.on('message', (rawData: Buffer) => {
        const textData = rawData.toString();
        console.log(`Received: ${textData}`);
        handleIncomingRoute(textData, socket);
    });
});


function handleIncomingRoute(rawData: string, senderSocket: WebSocket){
    //read targetHeadset string look it up in headsets Map
    try{
        const parsedData: SignalingMessage = JSON.parse(rawData);
        const destinationId = parsedData.targetId;
        const targetSocket = headsets.get(destinationId) || therapists.get(destinationId);

        //forward payload using .send()
        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({
                action: parsedData.action,
                payload: parsedData.payload
            }));
        } else {
            senderSocket.send(JSON.stringify({ error: "Target device unreachable"}));
        }
    } catch (error) {
        console.error("Failed to route incoming message payload: ", error);
    }
}
 
server.listen(PORT, () => {
    console.log(`Signaling server traffic controller active on port ${PORT}`);
});

