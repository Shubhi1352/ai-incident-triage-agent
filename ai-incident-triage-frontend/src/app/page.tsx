// src/app/page.tsx
"use client";

import React from "react";
import Navbar from "@/components/navbar/Navbar";
import TubeCursorBackground from "@/components/background/TubeCursorBackground";
import HeroContent from "@/components/landing/HeroContent";
import CreateIncidentForm from "@/components/form/CreateIncidentForm";
import HistoryPageContent from "@/components/history/History";
import IncidentDetailsPage from "@/components/incident/IncidentDetailsPage";
import styles from "./Home.module.css";
import { usePage } from "@/contexts/PageContext";

export default function Home() {
  const { currentPage, isIncidentTransitioning } = usePage();

  return (
    <main className={styles.main}>
      <Navbar />
      <div style={{ pointerEvents: "none"}}>
      <TubeCursorBackground/> 
      </div>

      {/* Home Page */}
      <div className={`${styles.page} ${styles.home}`} style={{
        transform: `translateX(${(currentPage === "home" ? 0 : currentPage === "create" ? -100 : -200)}%)`,
        opacity: currentPage === "incident" ? 0 : 1,
        pointerEvents: currentPage === "home" ? "auto" : "none"
      }}>
        <HeroContent/>
      </div>
      
      {/* Create Page */}
      <div className={`${styles.page} ${styles.create}`} style={{
        transform: `translateX(${(currentPage === "home" ? 100 : currentPage === "create" ? 0 : -100)}%)`,
        opacity: currentPage === "incident" ? 0 : 1,
        pointerEvents: currentPage === "create" ? "auto" : "none"
      }}>
        <CreateIncidentForm/>
      </div>
      
      {/* History Page */}
      <div className={`${styles.page} ${styles.history}`} style={{
        transform: `translateX(${(currentPage === "incident" || isIncidentTransitioning ? -100 : currentPage === "home" ? 200 : currentPage === "create" ? 100 : 0)}%)`,
        opacity: currentPage === "incident" || isIncidentTransitioning ? 0 : 1,
        pointerEvents: currentPage === "history" ? "auto" : "none"
      }}>
        <HistoryPageContent/>
      </div>
      
      {/* Incident Details Page */}
      <div className={styles.incidentPageContainer} style={{
          transform: `translateX(${currentPage === "incident" ? 0 : currentPage  === "history" ? 100 : 100}%)`,
          opacity: currentPage === "incident" ? 1 : 0,
          pointerEvents: currentPage === "incident" ? "auto" : "none"
      }}>
        <IncidentDetailsPage/>
      </div>
    </main>
  );
}