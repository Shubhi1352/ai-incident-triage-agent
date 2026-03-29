// src/components/IncidentDetailsPage.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./IncidentDetailsPage.module.css";
import { usePage } from "@/contexts/PageContext";
import { useColors } from "@/contexts/ColorContext";
import { AIChatService, IncidentService, IncidentWSMessage,ApiStandardResponse } from "@/service/api";
import { IncidentResponseDTO, IncidentUpdateRequestDTO } from "@/service/api";
import { useIncidentWebSocket } from "@/hooks/useIncidentWebSocket";
import { Pencil, Check, X, Loader2 } from "lucide-react";

enum ChatRole{
  USER = "USER",
  AI = "AI"
}

interface ChatMessageDTO {
    role: ChatRole;
    message: string;
    createdAt: string;
}

type EditableField = 'title' | 'description' | 'errorLog';

const IncidentDetailsPage: React.FC = () => {
  
  const { currentIncident, navigateTo } = usePage();
  const { primaryColor } = useColors();
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [incident, setIncident] = useState<IncidentResponseDTO | null>(currentIncident);
  const [isProcessingApi, setIsProcessingApi] = useState(false);
  const [activeEditField, setActiveEditField] = useState<EditableField | null>(null);
  const [editValues, setEditValues] = useState({
    title: '',
    description: '',
    errorLog: ''
  });

  useIncidentWebSocket(incident?.id, (wsMessage) => {
  if ((wsMessage.status === "TRIAGED" || wsMessage.status === "FAILED") && wsMessage.incident) {
    setIncident(wsMessage.incident);
  }
});

const chatEndRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chatMessages]);

  useEffect(() => {
    const fetchIncident = async () => {
      if (!currentIncident) return;

      try {
        const response = await IncidentService.getIncidentById(currentIncident.id);
        setIncident(response.data || response);
      } catch (err) {
        setError("Failed to fetch incident details");
      }
    };

    fetchIncident();
    
  }, [currentIncident]);

  useEffect(() => {
  const fetchChatHistory = async () => {
    if (!currentIncident) return;

    try {
      const response = await AIChatService.getChatHistory(currentIncident.id, 0, 10);

      const messages = response.data.items.map((msg: ChatMessageDTO) => ({
        role: msg.role === "USER" ? "user" : "ai",
        content: msg.message
      }));

      // reverse because backend sends DESC
      setChatMessages(messages.reverse());
    } catch (err) {
      console.error("Failed to load chat history");
    }
  };

  fetchChatHistory();
}, [currentIncident?.id]);

const handleStartEdit = (field: EditableField) => {
    if (!incident) return;
    setActiveEditField(field);
    
    // Initialize edit values with current data
    setEditValues(prev => ({
      ...prev,
      [field]: incident[field as keyof typeof incident] || ""
    }));
  };

  // ✅ HANDLE CANCEL EDIT
  const handleCancelEdit = () => {
    setActiveEditField(null);
  };  

  // ✅ HANDLE SAVE UPDATE
  const handleSaveUpdate = async () => {
    if (!incident) return;
    if (!activeEditField) return;
    
    setIsProcessingApi(true);
    try {
      const payload: IncidentUpdateRequestDTO = {
        title: incident.title,
        description: incident.description,
        errorLog: incident.errorLog
      };
      
      // Only send the field that was actually changed
      if (activeEditField === 'title') payload.title = editValues.title;
      if (activeEditField === 'description') payload.description = editValues.description;
      if (activeEditField === 'errorLog') payload.errorLog = editValues.errorLog;

      const response: ApiStandardResponse<IncidentResponseDTO> = await IncidentService.updateIncident(incident.id, payload);
      
      if (response.success) {
        // Optimistically update the state
        setIncident(prev => prev ? { ...prev, [activeEditField]: editValues[activeEditField as keyof typeof editValues] } : null);
        setActiveEditField(null);
        setError("");
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

  // ✅ CHECK IF UPDATES ARE ALLOWED
  const canEdit = incident && (incident.status === "TRIAGED" || incident.status === "FAILED");


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

  if (!incident) return <div className={styles.loading}>Loading incident details...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const EditControls = ({ fieldName }: { fieldName: EditableField }) => {
    const isActive = activeEditField === fieldName;
    const isDisabled = !canEdit && !isActive; 
    return (
      <div className={styles.editControls}>
        {!isActive && (
          <button 
            onClick={() => handleStartEdit(fieldName)}
            disabled={!canEdit}
            className={`${styles.iconButton} ${!canEdit ? styles.disabledIcon : ''}`}
            title={canEdit ? "Edit" : "Locked during AI processing"}
          >
            <Pencil size={16} />
          </button>
        )}
        
        {isActive && (
          <div className={styles.saveButtons}>
            <button onClick={handleSaveUpdate} className={styles.saveBtn} disabled={isProcessingApi}>
              {isProcessingApi ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button onClick={handleCancelEdit} className={styles.cancelBtn}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }; 

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{
          backgroundColor: "white",
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Incident Details</h1>
      </div>

      <div 
      className={styles.content}>
        {/* Incident Details */}
        <div 
        className={styles.incidentDetails}
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 10px ${primaryColor}20`
        }}>
          <div className={styles.detailsHeader}>
            {activeEditField === 'title' ? (
               <div className={styles.editInputContainer}>
                 <input 
                   type="text" 
                   value={editValues.title}
                   onChange={(e) => setEditValues({...editValues, title: e.target.value})}
                   className={styles.editInput}
                   autoFocus
                 />
                 <EditControls fieldName="title" />
               </div>
             ) : (
                <div className={styles.viewRow}>
                  <h2>{incident.title}</h2>
                  <EditControls fieldName="title" />
                </div>
             )}
            <div className={`${styles.status} ${styles[incident.status?.toString().toLowerCase() || '']}`}>
              {incident.status}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.fieldHeader}>
              <h3>Description</h3>
              <EditControls fieldName="description" />
            </div>
            
            {activeEditField === 'description' ? (
              <textarea 
                value={editValues.description}
                onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                className={styles.editTextArea}
                rows={4}
              />
            ) : (
              <p>{incident.description}</p>
            )}
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.fieldHeader}>
              <h3>Error Log</h3>
              <EditControls fieldName="errorLog" />
            </div>

            {activeEditField === 'errorLog' ? (
              <pre className={styles.editPre}>
                <textarea
                  value={editValues.errorLog}
                  onChange={(e) => setEditValues({...editValues, errorLog: e.target.value})}
                  className={styles.codeEditor}
                  rows={8}
                />
              </pre>
            ) : (
              <pre className={styles.errorLog}>{incident.errorLog}</pre>
            )}
          </div>

          {incident.severity && (
            <div style={{
              color: "#aaa",
              fontWeight: 600
              }}>
              <h3>Severity</h3>
              <p className={styles[incident.severity?.toLocaleLowerCase() || ""]}>{incident.severity || "N/A"}</p>
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
        <div 
        className={styles.aiChat}
        style={{
          borderColor: primaryColor,
          boxShadow: `0 0 10px ${primaryColor}20`
        }}>
          <h3 className={styles.chatTitle}>AI Assistant</h3>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.chatMessages}>
            {chatMessages.map((message, index) => (
              <div key={index} className={`${styles.chatMessage} ${styles[message.role]}`}>
                <div className={styles.messageContent}>{message.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
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