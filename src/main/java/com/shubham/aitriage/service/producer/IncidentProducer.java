package com.shubham.aitriage.service.producer;

public interface IncidentProducer {
    public void sendIncidentForProcessing(Long incidentId);
}
