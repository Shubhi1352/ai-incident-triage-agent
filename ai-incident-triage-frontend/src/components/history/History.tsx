// src/components/HistoryPageContent.tsx
"use client";

import React, { useState } from "react";
import styles from "./History.module.css";
import { useColors } from "@/contexts/ColorContext";
import { Incident, usePage } from "@/contexts/PageContext";

const mockIncidents = [
  { id: 1, title: "Server Down", description: "Main server is not responding", errorLog: "Connection refused", severity: "Critical", status: "Resolved", date: "2024-05-20" ,rootcause: "" , suggestedFix: ""},
  { id: 2, title: "Database Slow", description: "Database queries are taking too long", errorLog: "Query timeout", severity: "High", status: "In Progress", date: "2024-05-19" ,rootcause: "" , suggestedFix: ""},
  { id: 3, title: "API Error", description: "API is returning 500 errors", errorLog: "Internal server error", severity: "Medium", status: "Open", date: "2024-05-18" ,rootcause: "" , suggestedFix: ""},
];

const HistoryPageContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { primaryColor } = useColors();
  const { navigateTo, setCurrentIncident } = usePage();

  const filteredIncidents = mockIncidents.filter(incident => 
    incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.severity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIncidentClick = (incident: Incident) => {
    setCurrentIncident(incident);
    navigateTo("incident");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Incident History</h1>
      
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search incidents..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            borderColor: primaryColor,
            boxShadow: `0 0 10px ${primaryColor}20`
          }}
        />
      </div>
      
      <div className={styles.incidentContainer}>
        <div className={styles.incidentHeader}>
          <div className={styles.incidentHeaderItem}>Title</div>
          <div className={styles.incidentHeaderItem}>Severity</div>
          <div className={styles.incidentHeaderItem}>Status</div>
          <div className={styles.incidentHeaderItem}>Date</div>
        </div>
        
        <div className={styles.incidentList}>
          {filteredIncidents.map(incident => (
            <div key={incident.id} className={styles.incidentItem} onClick={() => handleIncidentClick(incident)} style={{ cursor: 'pointer' }}>
              <div className={styles.incidentTitle}>
                <h3>{incident.title}</h3>
                <p>{incident.description}</p>
              </div>
              <div className={`${styles.incidentSeverity} ${styles[incident.severity.toLowerCase()]}`}>
                {incident.severity}
              </div>
              <div className={`${styles.incidentStatus} ${styles[incident.status.toLowerCase()]}`}>
                {incident.status}
              </div>
              <div className={styles.incidentDate}>{incident.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPageContent;