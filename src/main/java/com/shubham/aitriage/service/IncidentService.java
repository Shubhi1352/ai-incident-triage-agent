package com.shubham.aitriage.service;

import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.dto.IncidentUpdateRequestDTO;
import java.util.List;

public interface IncidentService {
    public IncidentResponseDTO createIncident(IncidentRequestDTO incident);
    public List<IncidentResponseDTO> getAllIncidents();
    public IncidentResponseDTO getIncidentById(Long id);
    public IncidentResponseDTO updateIncident(Long id, IncidentUpdateRequestDTO incident);
    public void deleteIncident(Long id);
}
