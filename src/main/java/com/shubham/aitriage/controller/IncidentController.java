package com.shubham.aitriage.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.shubham.aitriage.service.IncidentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import com.shubham.aitriage.dto.ApiStandardResponse;
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

    @Operation(summary = "Create a new incident")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Incident created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/create")
    public ResponseEntity<ApiStandardResponse<IncidentResponseDTO>> create(@Valid @RequestBody IncidentRequestDTO request){
        IncidentResponseDTO response = incidentService.createIncident(request);
            ApiStandardResponse<IncidentResponseDTO> apiResponse=ApiStandardResponse.<IncidentResponseDTO>builder()
                .success(true)
                .message("Incident created successfully")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }

    @Operation(summary = "Get all incidents")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Incidents retrieved successfully")
    })
    @GetMapping("/getall")
    public ResponseEntity<ApiStandardResponse<List<IncidentResponseDTO>>> getAllIncidents() {
        List<IncidentResponseDTO> incidents = incidentService.getAllIncidents();
        ApiStandardResponse<List<IncidentResponseDTO>> apiResponse = ApiStandardResponse.<List<IncidentResponseDTO>>builder()
            .success(true)
            .message("Incidents retrieved successfully")
            .data(incidents)
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.ok(apiResponse);
    }

}
