package com.shubham.aitriage.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shubham.aitriage.entity.IncidentChat;

@Repository
public interface IncidentChatRepository extends JpaRepository<IncidentChat,Long>{
    List<IncidentChat> findTop5ByIncidentIdOrderByCreatedAtAsc(Long incidentId);
    Page<IncidentChat> findByIncidentId(Long incidentId,Pageable pageable);
    void deleteAllByIncidentId(Long incidentId);
}
