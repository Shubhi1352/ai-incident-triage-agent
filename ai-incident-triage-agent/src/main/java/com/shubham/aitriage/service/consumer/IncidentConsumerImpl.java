package com.shubham.aitriage.service.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.shubham.aitriage.repository.IncidentRepository;
import com.shubham.aitriage.service.aiAnalysis.AIAnalysisService;
import com.shubham.aitriage.config.RabbitMQConfig;
import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.shubham.aitriage.dto.IncidentWSMessage;
import com.shubham.aitriage.exception.ResourceNotFoundException;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.enums.Status;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentConsumerImpl implements IncidentConsumer{

    private final IncidentRepository incidentRepository;
    private final AIAnalysisService aiAnalysisService;
    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.INCIDENT_QUEUE, concurrency = "3")
    public void processIncident(Long incidentId){
        Incident incident = incidentRepository.findById(incidentId).orElseThrow(()-> new ResourceNotFoundException("incident not found :("));

        try{
            AIAnalysisResponse aiResult = aiAnalysisService.analyzeIncident(
                incident.getTitle(), incident.getDescription(), incident.getErrorLog());

            incident.setSeverity(Severity.valueOf(aiResult.getSeverity()));
            incident.setRootCause(aiResult.getRootCause());
            incident.setAiSuggestion(aiResult.getSuggestion());
            incident.setStatus(Status.TRIAGED);

            Incident saved = incidentRepository.save(incident);

            messagingTemplate.convertAndSend(
                "/topic/incidents/" + incidentId,
                new IncidentWSMessage(
                    Status.TRIAGED,
                    "AI analysis completed",
                    saved
                ) 
            );
        }catch (Exception e){
            messagingTemplate.convertAndSend(
                "/topic/incidents/" + incidentId,
                new IncidentWSMessage(
                    Status.FAILED,
                    "AI analysis failed :(",
                    null
                )
            );
        }
    }
}
