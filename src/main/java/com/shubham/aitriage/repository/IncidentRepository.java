package com.shubham.aitriage.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shubham.aitriage.entity.Incident;

public interface IncidentRepository extends JpaRepository<Incident,Long>{

}
