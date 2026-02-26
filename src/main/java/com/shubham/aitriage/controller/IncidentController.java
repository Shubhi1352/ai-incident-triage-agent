package com.shubham.aitriage.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.shubham.aitriage.service.IncidentService;
import com.shubham.aitriage.entity.Incident;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {
    private final IncidentService incidentService;

    @PostMapping("/create")
    public Incident create(@RequestBody Incident incident){
        return incidentService.createIncident(incident);
    }

    @GetMapping("/getall")
    public List<Incident> getAllIncidents() {
        return incidentService.getAllIncidents();
    }

}
