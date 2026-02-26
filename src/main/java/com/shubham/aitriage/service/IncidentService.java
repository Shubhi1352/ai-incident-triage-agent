package com.shubham.aitriage.service;

import com.shubham.aitriage.entity.Incident;
import java.util.List;

public interface IncidentService {
    public Incident createIncident(Incident incident);
    public List<Incident> getAllIncidents();
}
