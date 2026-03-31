// src/components/IncidentDetailsPage.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./IncidentDetailsPage.module.css";
import { usePage } from "@/contexts/PageContext";
import { useColors } from "@/contexts/ColorContext";
import { AIChatService, IncidentService, IncidentWSMessage,ApiStandardResponse } from "@/service/api";
import { IncidentResponseDTO, IncidentUpdateRequestDTO, Status } from "@/service/api";
import { useIncidentWebSocket } from "@/hooks/useIncidentWebSocket";
import { Pencil, Save, X, Loader2, RefreshCw } from "lucide-react";

enum ChatRole{
  USER = "USER",
  AI = "AI",
  SYSTEM = "SYSTEM"
}

interface ChatMessageDTO {
    role: ChatRole;
    message: string;
    createdAt: string;
}

const IncidentDetailsPage: React.FC = () => {
  
  const { currentIncident, navigateTo } = usePage();
  const { primaryColor } = useColors();
  const [isEditing, setIsEditing] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai" | "system"; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [incident, setIncident] = useState<IncidentResponseDTO | null>(currentIncident);
  const [isProcessingApi, setIsProcessingApi] = useState(false);
  const [editValues, setEditValues] = useState({
    title: currentIncident?.title || '',
    description: currentIncident?.description || '',
    errorLog: currentIncident?.errorLog || ''
  });

  useIncidentWebSocket(incident?.id, (wsMessage) => {
    if (isEditing && wsMessage.incident) {
      console.log("Received external update, cancelling edit...");
      setIsEditing(false);
      fetchIncidentData();
      fetchChatHistory();
      return;
    }

    if (wsMessage.status === "PROCESSING" || wsMessage.status === "TRIAGED" || wsMessage.status === "FAILED") {
      if(wsMessage.incident) {
        setIncident(wsMessage.incident);
      } else {
        setIncident(prev => prev ? { ...prev, status: wsMessage.status as Status } : null);
      }
      // If process finishes, update our edit buffer to match reality
      setEditValues(prev => ({
        title: wsMessage.incident?.title || prev.title,
        description: wsMessage.incident?.description || prev.description,
        errorLog: wsMessage.incident?.errorLog || prev.errorLog
      }));
      fetchChatHistory(); 
    }
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchIncidentData = async () => {
    if (!currentIncident) return;
    try {
      const response = await IncidentService.getIncidentById(currentIncident.id);
      const data = response.data || response;
      setIncident(data);
      
      setEditValues({
        title: data.title || '',
        description: data.description || '',
        errorLog: data.errorLog || ''
      });
    } catch (err) {
      console.error("Error fetching incident:", err);
    }
  };

  const fetchChatHistory = async () => {
    if (!currentIncident) return;
    try {
      const response = await AIChatService.getChatHistory(currentIncident.id, 0, 50);
      const messages = response.data.items.map((msg: ChatMessageDTO) => ({
        role: msg.role === "USER" ? "user" : msg.role === "AI" ? "ai" : "system",
        content: msg.message
      }));
      setChatMessages(messages.reverse());
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  useEffect(() => {
    fetchIncidentData();
    fetchChatHistory();
  }, [currentIncident]);

  const handleStartEdit = () => {
    console.log("Starting Global Edit Mode");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    console.log("Cancelled Edit Mode");
    setIsEditing(false);
    fetchIncidentData(); // Revert visual state
  };


const handleSaveUpdate = async () => {
    if (!incident) return;
    
    console.log("Saving Update...", editValues);
    setIsProcessingApi(true);
    setError("");
    
    try {
      const payload: IncidentUpdateRequestDTO = {
        title: editValues.title,
        description: editValues.description,
        errorLog: editValues.errorLog
      };

      const response = await IncidentService.updateIncident(incident.id, payload);
      
      if (response.success) {
        console.log("Update Successful");
        setIsEditing(false); // Exit edit mode
        
        setTimeout(() => {
           fetchIncidentData(); 
           fetchChatHistory();
        }, 500);
        
      } else {
        setError(response.message || "Failed to update");
      }
    } catch (err) {
      setError("Error saving changes");
      console.error(err);
    } finally {
      setIsProcessingApi(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !incident) return;
    setIsLoading(true);
    setError("");
    try {
      setChatMessages(prev => [...prev, { role: "user", content: newMessage }]);
      setNewMessage("");
      const response = await AIChatService.chat(incident.id, newMessage);
      setChatMessages(prev => [...prev, { role: "ai", content: response.data.answer }]);
    } catch (err) {
      setError("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryAnalysis = async () => {
  if (!incident?.id) return;

  setError(""); 
  setIsProcessingApi(true);
  
  try {
    await IncidentService.retryIncident(incident.id);
    
    setIncident(prev => prev ? { ...prev, status: Status.PROCESSING } : null);
  } catch (err) {
    setError("Could not restart analysis. Try again.");
  } finally {
    setIsProcessingApi(false);
  }
};

  if (!incident) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const currentStatus = incident?.status ? incident.status.toString().trim().toUpperCase() : "";
  const canEdit = incident && (currentStatus === "TRIAGED" || currentStatus === "FAILED");

return (
    <div className={styles.pageContentWrapper}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          color: 'transparent'
        }}>Incident Details</h1>
      </div>

      <div className={styles.content}>
        {/* LEFT PANEL */}
        <div className={styles.incidentDetails} style={{ borderColor: primaryColor }}>
          
          {/* ✅ IMPROVED HEADER LAYOUT */}
          <div className={styles.detailsHeaderWrapper}>
            {/* Left Side: Title */}
            <div className={styles.detailsHeaderLeft}>
              <h2>{incident.title}</h2>
              
              {!isEditing ? (
                <div className={styles.actionButtonsGroup}>
                  {/* Edit Button */}
                  {canEdit && (
                    <button 
                      onClick={handleStartEdit}
                      disabled={incident.status === "PROCESSING"}
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      title="Edit Details"
                    >
                      <Pencil size={14} /> <span>Edit</span>
                    </button>
                  )}

                  {/* Retry Button */}
                  {incident.status !== "PROCESSING" && (
                    <button 
                      onClick={handleRetryAnalysis}
                      disabled={isProcessingApi}
                      className={`${styles.actionBtn} ${styles.retryBtn}`}
                      title="Re-run Analysis"
                    >
                      {isProcessingApi ? <Loader2 size={14} className="spin"/> : <RefreshCw size={14}/>}
                      <span>Retry AI</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.saveCancelGroup}>
                  <button className={styles.cancelBtn} onClick={handleCancelEdit}><X size={14}/></button>
                  <button className={styles.saveBtn} onClick={handleSaveUpdate} disabled={isProcessingApi}>
                     {isProcessingApi ? <Loader2 size={14} className="spin"/> : <><Save size={14}/> <span>Save</span></>}
                  </button>
                </div>
              )}
            </div>

            {/* Right Side: Status Badge */}
            <div className={styles.statusBadgeContainer}>
              <div className={`${styles.statusBadge} ${styles[incident.status.toString().toLowerCase()]}`}>
                {incident.status}
              </div>
            </div>
          </div>

          {/* Content Fields */}
          <div className={styles.detailsSection}>
            <div className={styles.fieldLabel}>Title</div>
            {isEditing ? (
              <input type="text" value={editValues.title} onChange={(e) => setEditValues({...editValues, title: e.target.value})} className={styles.editInput} autoFocus />
            ) : <p>{incident.title}</p>}
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.fieldLabel}>Description</div>
            {isEditing ? (
              <textarea value={editValues.description} onChange={(e) => setEditValues({...editValues, description: e.target.value})} className={styles.editTextarea} rows={4} />
            ) : <p>{incident.description}</p>}
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.fieldLabel}>Error Log</div>
            {isEditing ? (
              <pre className={styles.editPre}><textarea value={editValues.errorLog} onChange={(e) => setEditValues({...editValues, errorLog: e.target.value})} className={styles.codeEditor} rows={6} /></pre>
            ) : <pre className={styles.errorLog}>{incident.errorLog}</pre>}
          </div>

          <div className={styles.readOnlySection}>
            <div className={styles.labelRow}><div className={styles.label}>Severity</div><div className={`${styles.value} ${styles[incident.severity?.toLowerCase()]}`}>{incident.severity}</div></div>
            <div className={styles.labelRow}><div className={styles.label}>Root Cause</div><div className={styles.value}>{incident.rootCause}</div></div>
            <div className={styles.labelRow}><div className={styles.label}>Suggested Fix</div><div className={styles.value}>{incident.aiSuggestion}</div></div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.aiChat} style={{ borderColor: primaryColor }}>
          <h3 className={styles.chatTitle}>AI Assistant</h3>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`${styles.chatBubble} ${styles[msg.role]}`}>
                {msg.role === 'system' && <div className={styles.systemMsgLabel}></div>}
                <div className={styles.msgContent}>{msg.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className={styles.inputArea}>
            <input type="text" className={styles.chatInput} placeholder="Ask AI..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} disabled={isLoading || isEditing} style={{ borderColor: primaryColor }} />
            <button className={styles.sendBtn} onClick={handleSendMessage} disabled={isLoading || isEditing} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)` }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailsPage;