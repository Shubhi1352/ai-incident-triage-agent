// src/hooks/useIncidentWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IncidentWSMessage } from '@/service/api';

export const useIncidentWebSocket = (
  incidentId?: number,
  onMessage?: (message: IncidentWSMessage) => void
) => {
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef<typeof onMessage>(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
 
  const connect = useCallback(() => {
    if (!incidentId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: (str: string) => console.log('[STOMP]', str),
    });

    client.onConnect = () => {
      console.log(`✅ WebSocket connected successfully for incident: ${incidentId}`);
      
      client.subscribe(`/topic/incidents/${incidentId}`, (message) => {
        try {
          const parsed = JSON.parse(message.body) as IncidentWSMessage;
          console.log('📨 WS Message received:', parsed);
          onMessageRef.current?.(parsed);
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP Error:', frame);
    };

    client.onWebSocketError = (event) => {
      console.error('❌ WebSocket Error:', event);
    };

    client.activate();
    clientRef.current = client;
  }, [incidentId]);

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
    clientRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { connect, disconnect };
};