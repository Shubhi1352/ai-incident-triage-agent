package com.shubham.aitriage.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.shubham.aitriage.service.IncidentService;
import com.shubham.aitriage.dto.ApiResponse;
import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import java.util.List;
import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.validation.Valid;



@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {
    private final IncidentService incidentService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<IncidentResponseDTO>> create(@Valid @RequestBody IncidentRequestDTO request){
        IncidentResponseDTO response = incidentService.createIncident(request);
            ApiResponse<IncidentResponseDTO> apiResponse=ApiResponse.<IncidentResponseDTO>builder()
                .success(true)
                .message("Incident created successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }

    @GetMapping("/getall")
    public ResponseEntity<ApiResponse<List<IncidentResponseDTO>>> getAllIncidents() {
        List<IncidentResponseDTO> incidents = incidentService.getAllIncidents();
        ApiResponse<List<IncidentResponseDTO>> apiResponse = ApiResponse.<List<IncidentResponseDTO>>builder()
            .success(true)
            .message("Incidents retrieved successfully")
            .data(incidents)
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.ok(apiResponse);
    }

}
