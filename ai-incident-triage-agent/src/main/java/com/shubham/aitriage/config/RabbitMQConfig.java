package com.shubham.aitriage.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class RabbitMQConfig {
    private static final Logger log = LoggerFactory.getLogger(RabbitMQConfig.class);
    public static final String INCIDENT_QUEUE = "incident.ai.queue";

    @Bean
    public Queue incidentQueue(){
        log.info("Creating queue {}", INCIDENT_QUEUE);
        return new Queue(INCIDENT_QUEUE, true);
    }
    
}
