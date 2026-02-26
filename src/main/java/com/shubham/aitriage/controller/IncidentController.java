package com.shubham.aitriage.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.shubham.aitriage.service.IncidentService;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.validation.Valid;



@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {
    private final IncidentService incidentService;

    @PostMapping("/create")
    public ResponseEntity<IncidentResponseDTO> create(@Valid @RequestBody IncidentRequestDTO request){
        return ResponseEntity.ok(incidentService.createIncident(request));
    }

    @GetMapping("/getall")
    public ResponseEntity<List<IncidentResponseDTO>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

}
