package com.shubham.aitriage.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.shubham.aitriage.repository.IncidentRepository;
import com.shubham.aitriage.exception.ResourceNotFoundException;

import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.dto.IncidentUpdateRequestDTO;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Status;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;

    private IncidentResponseDTO mapToResponseDTO(Incident incident) {
    return IncidentResponseDTO.builder()
            .id(incident.getId())
            .title(incident.getTitle())
            .description(incident.getDescription())
            .severity(incident.getSeverity())
            .status(incident.getStatus())
            .createdAt(incident.getCreatedAt())
            .build();
    }

    @Override
    public IncidentResponseDTO createIncident(IncidentRequestDTO incident) {
        Incident newIncident = new Incident();
        newIncident.setTitle(incident.getTitle());
        newIncident.setDescription(incident.getDescription());
        newIncident.setStatus(Status.OPEN);
        newIncident.setSeverity(incident.getSeverity());
        newIncident.setCreatedAt(LocalDateTime.now());
        Incident savedIncident = incidentRepository.save(newIncident);
        return mapToResponseDTO(savedIncident);
    }

    @Override
    public List<IncidentResponseDTO> getAllIncidents(){
        List<Incident> incidents = incidentRepository.findAll();
        List<IncidentResponseDTO> response = new ArrayList<>();
        for(Incident incident : incidents){
            response.add(mapToResponseDTO(incident));
        }
        return response;
    }

    @Override
    public IncidentResponseDTO getIncidentById(Long id){
        Incident incident = incidentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: "+id));
        return mapToResponseDTO(incident);
    }

    @Override
    public IncidentResponseDTO updateIncident(Long id, IncidentUpdateRequestDTO request){
        Incident incident =  incidentRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Incident not found with id: "+id));
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setStatus(Status.OPEN);
        Incident updatedIncident = incidentRepository.save(incident);
        return mapToResponseDTO(updatedIncident);
    }

    @Override
    public void deleteIncident(Long id){
        Incident incident = incidentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: "+id));
        incidentRepository.delete(incident);
    }
}
