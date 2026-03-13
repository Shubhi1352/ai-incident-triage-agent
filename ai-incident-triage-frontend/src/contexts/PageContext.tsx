// src/contexts/PageContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

type Page = "home" | "create" | "history" | "incident";

export interface Incident {
  id: number;
  title: string;
  description: string;
  errorLog: string;
  severity: string | null;
  rootcause: string | null;
  suggestedFix: string | null;
  status: string;
  date: string;
}

interface PageContextType {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  currentIncident: Incident | null;
  setCurrentIncident: (incident: Incident | null) => void;
  isWebSocketLoading: boolean;
  setIsWebSocketLoading: (loading: boolean) => void;
  isIncidentTransitioning: boolean;
  setIsIncidentTransitioning: (transitioning: boolean) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [isWebSocketLoading, setIsWebSocketLoading] = useState<boolean>(false);
  const [isIncidentTransitioning, setIsIncidentTransitioning] = useState<boolean>(false);

  const navigateTo = (page: Page) => {
    if (page === "incident") {
      setIsIncidentTransitioning(true);
      setTimeout(() => {
        setCurrentPage(page);
        setIsIncidentTransitioning(false);
      }, 800); // Match transition duration
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <PageContext.Provider value={{ 
      currentPage, 
      navigateTo, 
      currentIncident, 
      setCurrentIncident,
      isWebSocketLoading,
      setIsWebSocketLoading,
      isIncidentTransitioning,
      setIsIncidentTransitioning
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
};