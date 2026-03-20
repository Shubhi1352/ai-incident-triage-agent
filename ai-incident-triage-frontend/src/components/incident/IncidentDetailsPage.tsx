// src/components/IncidentDetailsPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import styles from "./IncidentDetailsPage.module.css";
import { usePage } from "@/contexts/PageContext";
import { useColors } from "@/contexts/ColorContext";
import { AIChatService, IncidentService, IncidentWSMessage } from "@/service/api";
import { IncidentResponseDTO } from "@/service/api";
import { useIncidentWebSocket } from "@/hooks/useIncidentWebSocket";

const IncidentDetailsPage: React.FC = () => {
  const handleWebSocketMessage = (wsMessage: IncidentWSMessage) => {
    if (wsMessage.incident) {
      setIncident(wsMessage.incident);
    }
  };
  const { currentIncident, navigateTo } = usePage();
  const { primaryColor } = useColors();
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [incident, setIncident] = useState<IncidentResponseDTO | null>(currentIncident);

  useIncidentWebSocket(incident?.id, handleWebSocketMessage);

  useEffect(() => {
    const fetchIncident = async () => {
      if (!currentIncident) return;

      try {
        const response = await IncidentService.getIncidentById(currentIncident.id);
        setIncident(response.data);
      } catch (err) {
        setError("Failed to fetch incident details");
      }
    };

    fetchIncident();
    
  }, [currentIncident]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !incident) return;

    setIsLoading(true);
    setError("");

    try {
      setChatMessages([...chatMessages, { role: "user", content: newMessage }]);
      setNewMessage("");

      const response = await AIChatService.chat(incident.id, newMessage);
      setChatMessages([...chatMessages, { role: "user", content: newMessage }, { role: "ai", content: response.data.answer }]);
    } catch (err) {
      setError("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  if (!incident) return <div className={styles.loading}>Loading incident details...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{
          backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Incident Details</h1>
        <button className={styles.backButton} onClick={() => navigateTo("history")} style={{
          borderColor: primaryColor,
          color: primaryColor
        }}>Back to History</button>
      </div>

      <div className={styles.content}>
        {/* Incident Details */}
        <div className={styles.incidentDetails}>
          <div className={styles.detailsHeader}>
            <h2>{incident.title}</h2>
            <div className={`${styles.status} ${styles[incident.status?.toString().toLowerCase() || '']}`}>
              {incident.status}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <h3>Description</h3>
            <p>{incident.description}</p>
          </div>

          <div className={styles.detailsSection}>
            <h3>Error Log</h3>
            <pre className={styles.errorLog}>{incident.errorLog}</pre>
          </div>

          {incident.severity && (
            <div className={styles.detailsSection}>
              <h3>Severity</h3>
              <p>{incident.severity || "N/A"}</p>
            </div>
          )}

          {incident.rootCause && (
            <div className={styles.detailsSection}>
              <h3>Root Cause</h3>
              <p>{incident.rootCause || "N/A"}</p>
            </div>
          )}

          {incident.aiSuggestion && (
            <div className={styles.detailsSection}>
              <h3>Suggested Fix</h3>
              <p>{incident.aiSuggestion || "N/A"}</p>
            </div>
          )}
        </div>

        {/* AI Chat */}
        <div className={styles.aiChat}>
          <h3 className={styles.chatTitle}>AI Assistant</h3>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.chatMessages}>
            {chatMessages.map((message, index) => (
              <div key={index} className={`${styles.chatMessage} ${styles[message.role]}`}>
                <div className={styles.messageContent}>{message.content}</div>
              </div>
            ))}
          </div>

          <div className={styles.chatInputContainer}>
            <input 
              type="text" 
              className={styles.chatInput} 
              placeholder="Ask AI about this incident..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              style={{
                borderColor: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}20`
              }}
            />
            <button className={styles.sendButton} onClick={handleSendMessage} disabled={isLoading} style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`
            }}>
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailsPage;