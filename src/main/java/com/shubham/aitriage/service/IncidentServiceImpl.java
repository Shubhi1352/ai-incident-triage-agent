package com.shubham.aitriage.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import com.shubham.aitriage.repository.IncidentRepository;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Status;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;

    public Incident createIncident(Incident incident) {
        incident.setStatus(Status.OPEN);
        incident.setCreatedAt(LocalDateTime.now());
        return incidentRepository.save(incident);
    }

    public List<Incident> getAllIncidents(){
        return incidentRepository.findAll();
    }

}
