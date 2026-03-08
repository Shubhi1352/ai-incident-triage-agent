package com.shubham.aitriage.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shubham.aitriage.entity.IncidentChat;

public interface IncidentChatRepository extends JpaRepository<IncidentChat,Long>{
    List<IncidentChat> findTop5ByIncidentIdOrderByCreatedAtAsc(Long incidentId);
}
