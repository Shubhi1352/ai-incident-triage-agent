package com.shubham.aitriage.service.producer;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.shubham.aitriage.config.RabbitMQConfig;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncidentProducerImpl implements IncidentProducer{

    private final RabbitTemplate rabbitTemplate;

    public void sendIncidentForProcessing(Long incidentId){
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.INCIDENT_QUEUE,
            incidentId
        );
    }
}
