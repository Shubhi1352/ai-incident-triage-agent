// src/components/HistoryPageContent.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./History.module.css";
import { useColors } from "@/contexts/ColorContext";
import { usePage } from "@/contexts/PageContext";
import { IncidentService, IncidentResponseDTO, Severity, IncidentWSMessage, Status } from "@/service/api";
import { useGlobalIncidentUpdates } from "@/hooks/useGlobalIncidentUpdates";

const HistoryPageContent: React.FC = () => {

  const { primaryColor } = useColors();
  const { navigateTo, setCurrentIncident, currentPage: activePage } = usePage();
  const [incidents, setIncidents] = useState<IncidentResponseDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const [searchTitle, setSearchTitle] = useState("");
  const [searchSeverity, setSearchSeverity] = useState<Severity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null >(null);

  const handleGlobalUpdates = (message: IncidentWSMessage) => {
    if(message.status === Status.TRIAGED ){
      console.log("🔄 Incident triaged via WS. Refreshing history list...");
      fetchIncidents(currentPage, searchTitle, searchSeverity, false);
    }
  }

  useGlobalIncidentUpdates(handleGlobalUpdates);

  // Fetch incidents from backend
  const fetchIncidents = async (page: number, title: string, severity: Severity | null, showFullLoader: boolean = true) => {
    if(showFullLoader) setIsLoading(true);
    else setIsPageLoading(true);
    setError("");
    try {
      
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
      setIsPageLoading(false);
    }
  };

  // Manual Search Handler (called on button click or Enter key)
  const handleSearch = () => {
    setCurrentPage(0);
    fetchIncidents(0, searchTitle, searchSeverity, true);
  };

  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle severity change
  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSearchSeverity(value ? Severity[value as keyof typeof Severity] : null);
    setCurrentPage(0);
  }; 

  const initiateDelete = (id: number, title: string) => {
    setDeleteTarget({id, title});
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await IncidentService.deleteIncident(deleteTarget.id);
      setDeleteTarget(null);
      // Refresh current view after deletion
      fetchIncidents(currentPage, searchTitle, searchSeverity, false);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete incident");
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  // Handle incident click (to view details)
  const handleIncidentClick = (incident: IncidentResponseDTO) => {
    if (!incident) return;
    setCurrentIncident(incident);
    navigateTo("incident");
  };

  const getSeverityClass = (severity: Severity | null | undefined) => {
    if (!severity) return styles.unknown;
    const severityLower = Severity[severity].toLowerCase();
    return styles[severityLower] || styles.unknown;
  };

  const truncateTitle = (title: string, maxLength: number = 45) => {
    if (!title) return "Untitled";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 2) {
        pages.push(0);
        if (currentPage > 3) pages.push("...");
      }

      const start = Math.max(0, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) {
        if (currentPage < totalPages - 4) pages.push("...");
        pages.push(totalPages - 1);
      }
    }
    return pages;
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setIsPageLoading(true);
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await fetchIncidents(newPage, searchTitle, searchSeverity, false);
    }
  };

  useEffect(() => {
  if (activePage === "history") {
    setCurrentPage(0);
  }
}, [activePage]);

// ✅ Fetch when page changes
useEffect(() => {
  if (activePage === "history") {
    fetchIncidents(currentPage, searchTitle, searchSeverity, true);
  }
}, [currentPage, activePage]);

  const showLoader = isLoading || isPageLoading;

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
            onKeyPress={handleKeyPress}
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

          <button 
            className={styles.searchButton}
            onClick={handleSearch}
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor})` 
            }}   
          >
            Search
          </button>
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
          <div className={styles.incidentHeaderItem}>Action</div>
        </div>
        
        <div className={styles.incidentList}>
          {incidents.length > 0 ?(
            <>
            {incidents.map((incident, index) => (
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
                  <div className={styles.incidentAction}>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        initiateDelete(incident.id!, incident.title || "Untitled");
                      }}
                      title="Delete Incident"
                    >
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6V5H5V4H7V5H17V4H19V5H21V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H3ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" />
                      </svg>
                    </button>
                  </div>
                </div>
            ))}
            </>
          ):(
            <div className={styles.emptyState}>
              <p>No incidents found</p>
            </div>
          )}
            {showLoader && (
              <div className={styles.loadingOverlay}>
                <div className={styles.spinner} style={{ borderColor: primaryColor }}></div>
                <p>Loading...</p>
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
                    disabled={isPageLoading}
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
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ borderColor: primaryColor }}>
            <h4 className={styles.modalTitle}>Confirm Deletion</h4>
            <p className={styles.modalText}>
              Are you sure you want to delete:<br/>
              <strong>{deleteTarget.title}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={cancelDelete}>Cancel</button>
              <button className={styles.deleteBtn} onClick={confirmDelete} style={{ backgroundColor: primaryColor }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPageContent;