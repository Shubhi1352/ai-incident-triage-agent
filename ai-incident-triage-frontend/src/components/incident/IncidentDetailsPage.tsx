// src/components/IncidentDetailsPage.tsx
"use client";

import React, { useEffect, useState } from "react";
import styles from "./IncidentDetailsPage.module.css";
import { usePage } from "@/contexts/PageContext";
import { useColors } from "@/contexts/ColorContext";

const IncidentDetailsPage: React.FC = () => {
  const { currentIncident, isWebSocketLoading, setIsWebSocketLoading, navigateTo } = usePage();
  const { primaryColor } = useColors();
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Mock WebSocket connection
  useEffect(() => {
    if (!currentIncident) return;

    setIsWebSocketLoading(true);

    // Simulate WebSocket connection and AI processing
    const timer = setTimeout(() => {
      const updatedIncident = {
        ...currentIncident,
        severity: "High",
        rootCause: "Database connection timeout",
        suggestedFix: "Increase database connection pool size",
        status: "COMPLETED"
      };

      setIsWebSocketLoading(false);
      // Update incident state here (you would normally get this from WebSocket)
      setChatMessages([
        { role: "ai", content: `I've analyzed the incident. The root cause is ${updatedIncident.rootCause}.` },
        { role: "ai", content: `Suggested fix: ${updatedIncident.suggestedFix}` }
      ]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIncident, setIsWebSocketLoading]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setChatMessages([...chatMessages, { role: "user", content: newMessage }]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      setChatMessages([...chatMessages, { role: "user", content: newMessage }, { role: "ai", content: "I'm analyzing your question..." }]);
    }, 1000);
  };

  if (!currentIncident) return null;

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
            <h2>{currentIncident.title}</h2>
            <div className={`${styles.status} ${styles[currentIncident.status.toLowerCase()]}`}>
              {currentIncident.status}
            </div>
          </div>

          {isWebSocketLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>AI is analyzing the incident...</p>
            </div>
          ) : (
            <>
              <div className={styles.detailsSection}>
                <h3>Description</h3>
                <p>{currentIncident.description}</p>
              </div>

              <div className={styles.detailsSection}>
                <h3>Error Log</h3>
                <pre className={styles.errorLog}>{currentIncident.errorLog}</pre>
              </div>

              <div className={styles.detailsSection}>
                <h3>Severity</h3>
                <p>{currentIncident.severity}</p>
              </div>

              <div className={styles.detailsSection}>
                <h3>Root Cause</h3>
                <p>{currentIncident.rootcause}</p>
              </div>

              <div className={styles.detailsSection}>
                <h3>Suggested Fix</h3>
                <p>{currentIncident.suggestedFix}</p>
              </div>
            </>
          )}
        </div>

        {/* AI Chat */}
        <div className={styles.aiChat}>
          <h3 className={styles.chatTitle}>AI Assistant</h3>
          
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
              style={{
                borderColor: primaryColor,
                boxShadow: `0 0 10px ${primaryColor}20`
              }}
            />
            <button className={styles.sendButton} onClick={handleSendMessage} style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)`
            }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailsPage;