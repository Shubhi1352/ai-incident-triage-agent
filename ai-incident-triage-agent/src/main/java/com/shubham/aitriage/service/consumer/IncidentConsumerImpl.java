package com.shubham.aitriage.service.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.shubham.aitriage.repository.IncidentRepository;
import com.shubham.aitriage.service.aiAnalysis.AIAnalysisService;
import com.shubham.aitriage.service.incident.IncidentService;
import com.shubham.aitriage.config.RabbitMQConfig;
import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.dto.IncidentWSMessage;
import com.shubham.aitriage.exception.ResourceNotFoundException;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.enums.Status;
import com.shubham.aitriage.service.producer.IncidentProducer;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentConsumerImpl implements IncidentConsumer{

    private static final Logger log = LoggerFactory.getLogger(IncidentConsumerImpl.class);

    private final IncidentRepository incidentRepository;
    private final AIAnalysisService aiAnalysisService;
    private final SimpMessagingTemplate messagingTemplate;
    private final IncidentService incidentService;
    private final IncidentProducer incidentProducer;

    @RabbitListener(queues = RabbitMQConfig.INCIDENT_QUEUE, concurrency = "3")
    public void processIncident(Long incidentId){
        log.info("Received incident {} from queue {}", incidentId, RabbitMQConfig.INCIDENT_QUEUE);
        Incident incident = incidentRepository.findById(incidentId).orElseThrow(()-> new ResourceNotFoundException("incident not found :("));

        try{
            AIAnalysisResponse aiResult = aiAnalysisService.analyzeIncident(
                incident.getTitle(), incident.getDescription(), incident.getErrorLog());

            incident.setSeverity(Severity.valueOf(aiResult.getSeverity()));
            incident.setRootCause(aiResult.getRootCause());
            incident.setAiSuggestion(aiResult.getSuggestion());
            incident.setStatus(Status.TRIAGED);
            incident.setRetryCount(0);

            Incident updatedIncident = incidentService.processAIResult(incidentId, aiResult);

            //Incident saved = incidentRepository.save(incident);

            log.info("Successfully processed incident {}", incidentId);

            messagingTemplate.convertAndSend(
                "/topic/incidents/" + incidentId,
                new IncidentWSMessage(
                    Status.TRIAGED,
                    "AI analysis completed",
                    updatedIncident
                ) 
            );

            messagingTemplate.convertAndSend(
                "/topic/incidents",
                new IncidentWSMessage(
                    Status.TRIAGED,
                    "Incidents updated",
                    updatedIncident
                )
            );
        }catch (Exception e){
            log.error("Failed to process incident {}", incidentId, e);
            handleFailure(incidentId);
        }
    }

    private void handleFailure(Long incidentId){
        try{
            Incident incident = incidentRepository.findById(incidentId).orElse(null);
            if(incident == null) return;
            incident.setRetryCount(incident.getRetryCount()+1);
            if(incident.getRetryCount()<=3){
                log.warn("Re-queuing incident {} (Attempt {}/3)", incidentId, incident.getRetryCount());
                incidentRepository.save(incident);
                incidentProducer.sendIncidentForProcessing(incidentId);
            }else {
                incident.setStatus(Status.FAILED);
                incidentRepository.save(incident);
                log.error("Incident {} failed after 3 attempts. Marked as FAILED.", incidentId);

                messagingTemplate.convertAndSend(
                    "/topic/incidents/" + incidentId,
                    new IncidentWSMessage(
                        Status.FAILED, 
                        "AI analysis failed after 3 attempts", 
                        incident
                    )
                );
                messagingTemplate.convertAndSend(
                "/topic/incidents",
                new IncidentWSMessage(
                    Status.FAILED,
                    "AI analysis failed :(",
                    incident
                )
            );
            }
        } catch (Exception ex) {
            log.error("Critical error while handling failure for incident {}", incidentId, ex);
        }
    }
}
