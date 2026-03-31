package com.shubham.aitriage.service.incident;

import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.dto.IncidentUpdateRequestDTO;
import com.shubham.aitriage.dto.PageResponse;
import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.entity.Incident;

import java.util.List;

public interface IncidentService {
    public IncidentResponseDTO createIncident(IncidentRequestDTO incident);
    public List<IncidentResponseDTO> getAllIncidents();
    public IncidentResponseDTO getIncidentById(Long id);
    public IncidentResponseDTO updateIncident(Long id, IncidentUpdateRequestDTO incident);
    public void deleteIncident(Long id);
    public PageResponse<IncidentResponseDTO> getIncidents(int page, int size, Severity severity,String title);
    public Incident processAIResult(Long incidentId, AIAnalysisResponse analysisResponse);
    public void retryIncident(Long id);
}
