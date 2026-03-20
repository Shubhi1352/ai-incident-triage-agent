package com.shubham.aitriage.service.producer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.shubham.aitriage.config.RabbitMQConfig;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentProducerImpl implements IncidentProducer{

    private final static Logger log = LoggerFactory.getLogger(IncidentProducerImpl.class);
    private final RabbitTemplate rabbitTemplate;

    public void sendIncidentForProcessing(Long incidentId){
        log.info("Sending incident {} to queue {}", incidentId, RabbitMQConfig.INCIDENT_QUEUE);
        try{
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.INCIDENT_QUEUE,
                incidentId
            );
            log.info("Successfully sent incident {} to queue {}", incidentId, RabbitMQConfig.INCIDENT_QUEUE);
        } catch (Exception e){
            log.error("Failed to send incident {} to queue {}", incidentId, RabbitMQConfig.INCIDENT_QUEUE, e);
        }
    }
}
