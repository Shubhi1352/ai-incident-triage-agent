// src/components/form/CreateIncidentForm.tsx
"use client";

import React, { useState } from "react";
import styles from "./CreateIncidentForm.module.css";
import { useColors } from "@/contexts/ColorContext";
import { usePage } from "@/contexts/PageContext";
import { IncidentService, IncidentWSMessage } from "@/service/api";
import { useIncidentWebSocket } from "@/hooks/useIncidentWebSocket";

const CreateIncidentForm: React.FC = () => {
  const { primaryColor,secondaryColor, tertiaryColor } = useColors();
  const { navigateTo, setCurrentIncident } = usePage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorLog, setErrorLog] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [incidentId, setIncidentId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState("Creating Incident...");

  // WebSocket handler
  const handleWebSocketMessage = (wsMessage: IncidentWSMessage) => {
    if (wsMessage.status === "TRIAGED" && wsMessage.incident) {
      setStatusMessage("Analysis Complete! Opening details...");
      setCurrentIncident(wsMessage.incident);
    } else if (wsMessage.status === "FAILED") {
      setError("AI Analysis failed. Please check history.");
      setIsLoading(false);
      setStatusMessage("Creation Failed");
    }
  };

  useIncidentWebSocket(incidentId || undefined, handleWebSocketMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setStatusMessage("Submitting to AI...");
    try {
      if (!title.trim() || !description.trim() || !errorLog.trim()) {
        throw new Error("All fields are required");
      }

      const response = await IncidentService.createIncident({ title, description, errorLog });
      const createdIncident = response?.data;
      if(!createdIncident?.id) throw new Error("Failed to get incident ID");
      setTitle("");
      setDescription("");
      setErrorLog("");
      setCurrentIncident(createdIncident);
      setIncidentId(createdIncident.id);
      navigateTo("incident");
      setIsLoading(false);

      //navigateTo("history");
    } catch (err) {
      setError("Failed to create incident. Please try again.");
    }
  };  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add Incident</h1>
      
      {/* ✅ Error notification */}
      {error && (
        <div className={styles.errorNotification}>
          <div className={styles.errorIcon}>❌</div>
          <div className={styles.errorMessage}>{error}</div>
          <button className={styles.errorClose} onClick={() => setError("")}>×</button>
        </div>
      )}
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} style={{ borderColor: primaryColor }}></div>
          <h3>{statusMessage}</h3>
          <p>Please wait while AI analyzes the error log.<br />This may take a few minutes.</p>
          {!incidentId && <p style={{fontSize: '0.8rem', color: '#888'}}>Submitting request...</p>}
          {incidentId && <p style={{fontSize: '0.8rem', color: '#888'}}>Waiting for analysis result...</p>}
        </div>
      ) : (
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Enter incident title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{
              borderColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}20`
            }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea 
            className={styles.textarea} 
            placeholder="Enter incident description" 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              borderColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}20`
            }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Error Log</label>
          <textarea 
            className={styles.textarea} 
            placeholder="Enter error log" 
            rows={4}
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            required
            style={{
              borderColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}20`
            }}
          />
        </div>
        <button 
          type="submit" 
          className={styles.button} 
          disabled={isLoading}
          style={{
            '--primary': primaryColor,
            '--secondary': secondaryColor,
            '--tertiary': tertiaryColor,
          } as React.CSSProperties}
        >
          {isLoading ? "Creating Incident..." : "Create Incident"}
        </button>
      </form>
      )}
    </div>
  );
};

export default CreateIncidentForm;