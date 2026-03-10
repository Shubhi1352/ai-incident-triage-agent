package com.shubham.aitriage.service.asyncProcessor;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.shubham.aitriage.dto.IncidentWSMessage;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.enums.Status;
import com.shubham.aitriage.exception.ResourceNotFoundException;
import com.shubham.aitriage.repository.IncidentRepository;
import com.shubham.aitriage.service.aiAnalysis.AIAnalysisService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentAIProcessorImpl implements IncidentAIProcessor{
    private final IncidentRepository incidentRepository;
    private final AIAnalysisService aiAnalysisService;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    public void processIncidentAI(Long incidentId){
        
        Incident incident = incidentRepository.findById(incidentId).orElseThrow(()-> new ResourceNotFoundException("incident not found"));
        sendProgress(incidentId, "AI analyzing incident...");
        try{
            AIAnalysisResponse aiResult = aiAnalysisService.analyzeIncident(
                incident.getTitle(),
                incident.getDescription(),
                incident.getErrorLog()
            );
            incident.setSeverity(Severity.valueOf(aiResult.getSeverity()));
            incident.setRootCause(aiResult.getRootCause());
            incident.setAiSuggestion(aiResult.getSuggestion());
            incident.setStatus(Status.TRIAGED);

            Incident saved = incidentRepository.save(incident);

            messagingTemplate.convertAndSend(
                "/topic/incidents/"+incidentId,
                new IncidentWSMessage(
                    Status.TRIAGED,
                    "AI is analysis completed..",
                    saved
                )
            );
        }catch(Exception e){
            messagingTemplate.convertAndSend(
                "/topic/incidents/"+incidentId,
                new IncidentWSMessage(
                    Status.FAILED,
                    "Ai analysis failed :(",
                    null
                )
            );

        }
    }

    private void sendProgress(Long id, String message){
        messagingTemplate.convertAndSend(
            "/topic/incidents/"+id,
            new IncidentWSMessage(
                Status.PROCESSING,
                message,
                null
            )
        );
    }
}
