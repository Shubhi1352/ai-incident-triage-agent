package com.shubham.aitriage.repository;

import com.shubham.aitriage.enums.Severity;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import com.shubham.aitriage.entity.Incident;

@Repository
public interface IncidentRepository extends JpaRepository<Incident,Long>{
    public Page<Incident> findBySeverity(Severity severity,Pageable pageable);
    public Page<Incident> findByTitleContainingIgnoreCase(String title,Pageable pageable);
}
