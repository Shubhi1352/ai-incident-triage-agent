import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IncidentWSMessage, Status } from '@/service/api';

export const useGlobalIncidentUpdates = (onUpdate: (message: IncidentWSMessage) => void) => {
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: (str: string) => console.log('[STOMP Global]', str),
    });

    client.onConnect = () => {
      console.log('✅ Global WebSocket connected - listening for all incident updates');
      
      client.subscribe('/topic/incidents', (message) => {
        try {
          const parsed: IncidentWSMessage = JSON.parse(message.body);
          console.log('📨 Global WS Update received:', parsed);
          onUpdate(parsed);
        } catch (err) {
          console.error('Failed to parse global WS message', err);
        }
      });
    };

    client.activate();
    clientRef.current = client;
  }, [onUpdate]);

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);
};