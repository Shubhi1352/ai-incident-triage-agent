// src/hooks/useGlobalIncidentUpdates.ts
import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IncidentWSMessage, Status } from '@/service/api';

let globalClient: Client | null = null;   // ← Singleton pattern

export const useGlobalIncidentUpdates = (onUpdate: (message: IncidentWSMessage) => void) => {
  
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (globalClient && globalClient.active) {
      console.log("✅ Global WS already connected");
      return;
    }

    console.log("🔌 Creating global WebSocket connection...");

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: (str: string) => console.log('[STOMP Global]', str),
    });

    client.onConnect = () => {
      console.log('✅ Global WebSocket connected - listening for all updates');
      client.subscribe('/topic/incidents', (message) => {
        try {
          const parsed: IncidentWSMessage = JSON.parse(message.body);
          onUpdateRef.current(parsed);
        } catch (err) {
          console.error('Failed to parse global message', err);
        }
      });
    };

    client.activate();
    globalClient = client;

    return () => {
      // Only disconnect if no other components are using it
      console.log("🧹 Cleaning up global WS (but keeping connection alive)");
    };
  }, []);
};