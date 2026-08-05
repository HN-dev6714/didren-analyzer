"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));

var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});

var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();

Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http = __importStar(require("http"));
const therapists = new Map();
const headsets = new Map();

const server = http.createServer();
const PORT = process.env.PORT || 8080;
const wss = new ws_1.WebSocketServer({ server });

console.log(`WebSocket engine instantiated directly on port ${PORT}`);

wss.on('connection', (socket, request) => {
    const urlParams = new URL(request.url || '', `http://${request.headers.host}`);
    const clientRole = urlParams.searchParams.get('role');
    const clientId = urlParams.searchParams.get('id');
    //check incoming connections URLs. If connection comes from Unity, 
    //parse serial number and run headsets.set(serial, socket);
    //if website, run therapists.set(therapistId, socket);
    if (clientRole === 'headset' && clientId) {
        headsets.set(clientId, socket);
        console.log(`Headset Registered: ${clientId}`);
    }
    else if (clientRole === 'therapist' && clientId) {
        //pass Supabase JWT Access Token through connection URL parameters
        //to verify therapist identity
        therapists.set(clientId, socket);
        console.log(`Therapist Registered: ${clientId}`);
    }
    socket.on('close', () => {
        if (clientRole === 'headset' && clientId) {
            headsets.delete(clientId);
        }
        else if (clientRole === 'therapist' && clientId) {
            therapists.delete(clientId);
        }
        console.log(`Client disconnected: ${clientId}`);
    });
    //inside socket.on('message') listener, parse JSON payload
    socket.on('message', (rawData) => {
        const textData = rawData.toString();
        console.log(`Received: ${textData}`);
        handleIncomingRoute(textData, socket);
    });
});

function handleIncomingRoute(rawData, senderSocket) {
    //read targetHeadset string look it up in headsets Map
    try {
        const parsedData = JSON.parse(rawData);
        const destinationId = parsedData.targetId;
        const targetSocket = headsets.get(destinationId) || therapists.get(destinationId);
        //forward payload using .send()
        if (targetSocket && targetSocket.readyState === ws_1.WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({
                action: parsedData.action,
                payload: parsedData.payload
            }));
        }
        else {
            senderSocket.send(JSON.stringify({ error: "Target device unreachable" }));
        }
    }
    catch (error) {
        console.error("Failed to route incoming message payload: ", error);
    }
}

server.listen(PORT, () => {
    console.log(`Signaling server traffic controller active on port ${PORT}`);
});
