package com.shubham.aitriage.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.shubham.aitriage.repository.IncidentRepository;

import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Status;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;

    @Override
    public IncidentResponseDTO createIncident(IncidentRequestDTO incident) {
        Incident newIncident = new Incident();
        newIncident.setTitle(incident.getTitle());
        newIncident.setDescription(incident.getDescription());
        newIncident.setStatus(Status.OPEN);
        newIncident.setSeverity(incident.getSeverity());
        newIncident.setCreatedAt(LocalDateTime.now());
        Incident savedIncident = incidentRepository.save(newIncident);
        return IncidentResponseDTO.builder()
                .id(savedIncident.getId())
                .title(savedIncident.getTitle())
                .description(savedIncident.getDescription())
                .status(savedIncident.getStatus())
                .severity(savedIncident.getSeverity())
                .createdAt(savedIncident.getCreatedAt())
                .build();
    }

    public List<IncidentResponseDTO> getAllIncidents(){
        List<Incident> incidents = incidentRepository.findAll();
        List<IncidentResponseDTO> response = new ArrayList<>();
        for(Incident incident : incidents){
            response.add(IncidentResponseDTO.builder()
                    .id(incident.getId())
                    .title(incident.getTitle())
                    .description(incident.getDescription())
                    .status(incident.getStatus())
                    .severity(incident.getSeverity())
                    .createdAt(incident.getCreatedAt())
                    .build());
        }
        return response;
    }

}
