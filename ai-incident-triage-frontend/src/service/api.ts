

// src/services/api.ts
const BASE_URL = 'http://localhost:8080/api';

// ✅ Add CORS headers
const headers = {
  'Content-Type': 'application/json',
};

export enum Status {
  OPEN = "OPEN",
  PROCESSING = "PROCESSING",
  TRIAGED = "TRIAGED",
  CLOSED = "CLOSED",
  FAILED = "FAILED"
}

export interface IncidentWSMessage {
  status: Status;
  message: string;
  incident?: IncidentResponseDTO | null;
}

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export interface IncidentResponseDTO {
    id: number;
    title: string;
    description: string;
    errorLog: string;
    severity: Severity;
    rootCause: string;
    aiSuggestion: string;
    status: Status;
    createdAt: string;
}

export interface IncidentUpdateRequestDTO {
    title: string;
    description: string;
    errorLog: string;
}

export interface PageResponse<T> {
    items: T[];
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiStandardResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}


// Incident API Service
export const IncidentService = {
  // Create a new incident
  createIncident: async (incident: { title: string; description: string; errorLog: string }) => {
    const response = await fetch(`${BASE_URL}/incidents/create`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(incident),
    });
    
    if (!response.ok) {
      // ✅ Get error message from response
      const error = await response.json();
      throw new Error(error.message || 'Failed to create incident');
    }
    
    return response.json();
  },

  // Get all incidents
  getAllIncidents: async () => {
    const response = await fetch(`${BASE_URL}/incidents/getall`, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch incidents');
    }
    
    return response.json();
  },

  // Get incident by ID
  getIncidentById: async (incidentId: number) => {
    const response = await fetch(`${BASE_URL}/incidents/getbyid/${incidentId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch incident');
    }

    return response.json();
  },

  // Update incident
  updateIncident: async (incidentId: number, incident: IncidentUpdateRequestDTO) => {
    const response = await fetch(`${BASE_URL}/incidents/update/${incidentId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(incident),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update incident');
    }

    return response.json();
  },

  // Delete incident
  deleteIncident: async (incidentId: number) => {
    const response = await fetch(`${BASE_URL}/incidents/delete/${incidentId}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete incident');
    }

    return response.json();
  },

  // Get incidents with pagination and search
  getIncidents: async (page: number, size: number, severity: Severity | null, title?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (severity) {
      params.append('severity', severity.toString());
    }
    
    if (title && title.trim() !== "") {
      params.append('title', title);
    }
    
    const response = await fetch(`${BASE_URL}/incidents/getincidents?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch incidents');
    }

    return response.json();
  },
};

// AI Chat API Service
export const AIChatService = {
  // Send message to AI chat
  chat: async (incidentId: number, message: string) => {
    const response = await fetch(`${BASE_URL}/ai/chat/${incidentId}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get AI response');
    }

    return response.json();
  },

  // Get chat history for incident
  getChatHistory: async (incidentId: number, page: number, size: number) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await fetch(`${BASE_URL}/ai/chat/${incidentId}/history?${params}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch chat history');
    }

    return response.json();
  },
};