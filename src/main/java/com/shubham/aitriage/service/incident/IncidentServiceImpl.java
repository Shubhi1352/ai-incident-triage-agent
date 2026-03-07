package com.shubham.aitriage.service.incident;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.shubham.aitriage.repository.IncidentRepository;
import com.shubham.aitriage.service.aiAnalysis.AIAnalysisService;
import com.shubham.aitriage.exception.ResourceNotFoundException;
import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.dto.IncidentUpdateRequestDTO;
import com.shubham.aitriage.dto.PageResponse;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.enums.Status;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    public static final String INCIDENT_CACHE = "incidents";
    public static final String INCIDENT_PAGE_CACHE = "incidents_page";

    private final IncidentRepository incidentRepository;
    private final AIAnalysisService aiAnalysisService;

    private IncidentResponseDTO mapToResponseDTO(Incident incident) {
    return IncidentResponseDTO.builder()
            .id(incident.getId())
            .title(incident.getTitle())
            .description(incident.getDescription())
            .errorLog(incident.getErrorLog())
            .severity(incident.getSeverity())
            .aiSuggestion(incident.getAiSuggestion())
            .rootCause(incident.getRootCause())
            .status(incident.getStatus())
            .createdAt(incident.getCreatedAt())
            .build();
    }

    @CacheEvict(value = {INCIDENT_PAGE_CACHE}, allEntries = true)
    @Override
    public IncidentResponseDTO createIncident(IncidentRequestDTO request) {
        AIAnalysisResponse aiResult;
        try{
            aiResult = aiAnalysisService.analyzeIncident(
                request.getTitle(), request.getDescription(), request.getErrorLog()
            );
        }catch( Exception e){
            throw new RuntimeException("AI analysis failed");
        }

        Incident newIncident = new Incident();
        newIncident.setTitle(request.getTitle());
        newIncident.setDescription(request.getDescription());
        newIncident.setErrorLog(request.getErrorLog());
        newIncident.setStatus(Status.OPEN);
        newIncident.setSeverity(Severity.valueOf(aiResult.getSeverity()));
        newIncident.setRootCause(aiResult.getRootCause());
        newIncident.setAiSuggestion(aiResult.getSuggestion());
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

    @Cacheable(value = INCIDENT_CACHE, key = "#id")
    @Override
    public IncidentResponseDTO getIncidentById(Long id){
        Incident incident = incidentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: "+id));
        return mapToResponseDTO(incident);
    }

    @CacheEvict(value = {INCIDENT_CACHE, INCIDENT_PAGE_CACHE}, allEntries = true)
    @Override
    public IncidentResponseDTO updateIncident(Long id, IncidentUpdateRequestDTO request){
        Incident incident =  incidentRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Incident not found with id: "+id));
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setStatus(Status.OPEN);
        Incident updatedIncident = incidentRepository.save(incident);
        return mapToResponseDTO(updatedIncident);
    }

    @CacheEvict(value = {INCIDENT_CACHE, INCIDENT_PAGE_CACHE}, allEntries = true)
    @Override
    public void deleteIncident(Long id){
        Incident incident = incidentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: "+id));
        incidentRepository.delete(incident);
    }

    @Cacheable(value = INCIDENT_PAGE_CACHE, key = "#page + '-' + #size + '-' + #severity + '-' + #title")
    @Override
    public PageResponse<IncidentResponseDTO> getIncidents(int page,int size, Severity severity, String title){
        Pageable pageable = PageRequest.of(page,size,Sort.by("createdAt").descending());
        Page<Incident> incidentPage;
        if(severity != null && title != null && !title.isEmpty()){
            incidentPage = incidentRepository.findBySeverityAndTitleContainingIgnoreCase(severity, title, pageable);
        }else if(severity != null){
            incidentPage = incidentRepository.findBySeverity(severity, pageable);
        }else if(title != null && !title.isEmpty()){
            incidentPage = incidentRepository.findByTitleContainingIgnoreCase(title, pageable);
        }else{
            incidentPage = incidentRepository.findAll(pageable);
        }
        List<IncidentResponseDTO> items=incidentPage
            .getContent()
            .stream().map(this::mapToResponseDTO)
            .toList();

        return PageResponse.<IncidentResponseDTO>builder()
            .items(items)
            .currentPage(incidentPage.getNumber())
            .pageSize(incidentPage.getSize())
            .totalItems(incidentPage.getTotalElements())
            .totalPages(incidentPage.getTotalPages())
            .build();
    }
}
