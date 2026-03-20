// src/components/HistoryPageContent.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./History.module.css";
import { useColors } from "@/contexts/ColorContext";
import { usePage } from "@/contexts/PageContext";
import { IncidentService, IncidentResponseDTO, PageResponse, Severity, IncidentWSMessage, Status } from "@/service/api";
import { useGlobalIncidentUpdates } from "@/hooks/useGlobalIncidentUpdates";

const HistoryPageContent: React.FC = () => {

  const handleGlobalUpdates = (message: IncidentWSMessage) => {
    if(message.status === Status.TRIAGED){
      console.log("🔄 Incident triaged via WS. Refreshing history list...");
      fetchIncidents(currentPage, debouncedTitle, searchSeverity);
    }
  }

  useGlobalIncidentUpdates(handleGlobalUpdates);

  const { primaryColor } = useColors();
  const { navigateTo, setCurrentIncident } = usePage();
  
  // Pagination state
  const [incidents, setIncidents] = useState<IncidentResponseDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  
  // Search state
  const [searchTitle, setSearchTitle] = useState("");
  const [searchSeverity, setSearchSeverity] = useState<Severity | null>(null);
  const [debouncedTitle, setDebouncedTitle] = useState("");
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce title search (wait 500ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(searchTitle);
      // ✅ Reset to page 0 when search changes
      if (searchTitle !== debouncedTitle) {
        setCurrentPage(0);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTitle, debouncedTitle]);

  // Fetch incidents from backend
  const fetchIncidents = useCallback(async (page: number, title: string, severity: Severity | null) => {
    try {
      setIsLoading(true);
      setError("");
      
      console.log("🔍 Fetching:", { page, size: pageSize, title, severity });
      
      const response = await IncidentService.getIncidents(page,pageSize,severity,title);
      const pageData  = response?.data;
      console.log("✅ Response:", pageData);
      console.log("✅ Items:", pageData?.items);
      console.log("✅ Total pages:", pageData?.totalPages);
      
      setIncidents(pageData?.items || []);
      setCurrentPage(pageData?.currentPage || 0);
      setTotalPages(pageData?.totalPages || 1);
      setTotalItems(pageData?.totalItems || 0);
    } catch (err) {
      console.error("❌ Failed to fetch:", err);
      setIncidents([]);
      setError(err instanceof Error ? err.message : "Failed to fetch incidents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Fetch when page, debounced title, or severity changes
  useEffect(() => {
    fetchIncidents(currentPage, debouncedTitle, searchSeverity);
  }, [currentPage, debouncedTitle, searchSeverity, fetchIncidents]);

  // ✅ Handle severity change - reset to page 0
  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSearchSeverity(value? Severity[value as keyof typeof Severity] : null);
    setCurrentPage(0); // ✅ Reset to first page
  };

  // ✅ Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ✅ Handle incident click
  const handleIncidentClick = (incident: IncidentResponseDTO) => {
    if (!incident) return;
    setCurrentIncident(incident);
    navigateTo("incident");
  };

  // ✅ Get severity class
  const getSeverityClass = (severity: Severity | null | undefined) => {
    if (!severity) return styles.unknown;
    const severityLower = Severity[severity].toLowerCase();
    return styles[severityLower] || styles.unknown;
  };

  // ✅ Truncate title if too long
  const truncateTitle = (title: string, maxLength: number = 45) => {
    if (!title) return "Untitled";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  // ✅ Generate page numbers for pagination (Google-style)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, current area, last with ellipsis
      if (currentPage > 2) {
        pages.push(0);
        if (currentPage > 3) pages.push("...");
      }
      
      const start = Math.max(0, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        if (currentPage < totalPages - 4) pages.push("...");
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Incident History</h3>
        <div className={styles.loading}>
          <div className={styles.spinner} style={{ borderColor: primaryColor }}>
            <div className={styles.spinnerInner} style={{ backgroundColor: primaryColor }}></div>
          </div>
          <p>Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Incident History</h3>
      
      {error && (
        <div className={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}
      
      {/* Search & Filter */}
      <div className={styles.searchContainer}>
        <div className={styles.searchRow}>
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Search by title..." 
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{
              borderColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}15`
            }}
          />
          
          <select 
            className={styles.filterSelect}
            value={searchSeverity ? Severity[searchSeverity] : ""}
            onChange={handleSeverityChange}
            style={{
              borderColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}15`
            }}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        
        <div className={styles.resultsInfo}>
          Showing {incidents.length} of {totalItems} incidents (Page {currentPage + 1} of {totalPages})
        </div>
      </div>
      
      {/* Incident Table */}
      <div className={styles.incidentContainer}>
        <div className={styles.incidentHeader}>
          <div className={styles.incidentHeaderItem}>Title</div>
          <div className={styles.incidentHeaderItem}>Severity</div>
          <div className={styles.incidentHeaderItem}>Date</div>
        </div>
        
        <div className={styles.incidentList}>
          {incidents.length > 0 ? (
            incidents.map((incident, index) => {
              if (!incident) return null;
              
              return (
                <div 
                  key={incident.id || index} 
                  className={styles.incidentItem} 
                  onClick={() => handleIncidentClick(incident)}
                >
                  <div className={styles.incidentTitle} title={incident.title || "Untitled"}>
                    <h3>{truncateTitle(incident.title || "Untitled", 45)}</h3>
                  </div>
                  <div className={`${styles.incidentSeverity} ${getSeverityClass(incident.severity)}`}>
                    {incident.severity || "N/A"}
                  </div>
                  <div className={styles.incidentDate}>
                    {incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p>No incidents found</p>
            </div>
          )}
        </div>
        
        {/* ✅ Pagination - Google Style */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              ← Prev
            </button>
            
            <div className={styles.pageNumbers}>
              {getPageNumbers().map((page, index) => (
                typeof page === "number" ? (
                  <button
                    key={index}
                    className={`${styles.pageNumber} ${page === currentPage ? styles.active : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page + 1}
                  </button>
                ) : (
                  <span key={index} className={styles.pageEllipsis}>{page}</span>
                )
              ))}
            </div>
            
            <button 
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPageContent;