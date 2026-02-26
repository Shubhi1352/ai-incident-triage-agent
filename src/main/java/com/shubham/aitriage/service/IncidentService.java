package com.shubham.aitriage.service;

import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.entity.Incident;
import java.util.List;

public interface IncidentService {
    public IncidentResponseDTO createIncident(IncidentRequestDTO incident);
    public List<IncidentResponseDTO> getAllIncidents();
}
