package com.shubham.aitriage.service;

import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.dto.IncidentUpdateRequestDTO;
import com.shubham.aitriage.enums.Severity;

import java.util.List;

import org.springframework.data.domain.Page;

public interface IncidentService {
    public IncidentResponseDTO createIncident(IncidentRequestDTO incident);
    public List<IncidentResponseDTO> getAllIncidents();
    public IncidentResponseDTO getIncidentById(Long id);
    public IncidentResponseDTO updateIncident(Long id, IncidentUpdateRequestDTO incident);
    public void deleteIncident(Long id);
    public Page<IncidentResponseDTO> getIncidents(int page, int size, Severity severity,String title);
}
