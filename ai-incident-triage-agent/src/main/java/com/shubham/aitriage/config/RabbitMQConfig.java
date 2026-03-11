package com.shubham.aitriage.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String INCIDENT_QUEUE = "incident.ai.queue";

    @Bean
    public Queue incidentQueue(){
        return new Queue(INCIDENT_QUEUE, true);
    }
    
}
