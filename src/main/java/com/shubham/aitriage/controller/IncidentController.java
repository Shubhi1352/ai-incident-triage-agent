package com.shubham.aitriage.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.shubham.aitriage.service.IncidentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import com.shubham.aitriage.dto.ApiStandardResponse;
import com.shubham.aitriage.dto.IncidentRequestDTO;
import com.shubham.aitriage.dto.IncidentResponseDTO;
import com.shubham.aitriage.dto.IncidentUpdateRequestDTO;
import com.shubham.aitriage.dto.PageResponse;
import com.shubham.aitriage.enums.Severity;

import java.util.List;
import java.time.LocalDateTime;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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


    @Operation(summary = "Get incident by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Incident retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    @GetMapping("/getbyid/{id}")
    public ResponseEntity<ApiStandardResponse<IncidentResponseDTO>> getById(@PathVariable Long id){
        IncidentResponseDTO response=incidentService.getIncidentById(id);
        ApiStandardResponse<IncidentResponseDTO> apiResponse = ApiStandardResponse.<IncidentResponseDTO>builder()
            .success(true)
            .message("Incident retrieved successfully")
            .data(response)
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.ok(apiResponse);
    }


    @PutMapping("/update/{id}")
    @Operation(summary = "Update an existing incident")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Incident updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<ApiStandardResponse<IncidentResponseDTO>> update(@PathVariable Long id, @Valid @RequestBody IncidentUpdateRequestDTO request) {
        IncidentResponseDTO response = incidentService.updateIncident(id, request);
        ApiStandardResponse<IncidentResponseDTO> apiResponse = ApiStandardResponse.<IncidentResponseDTO>builder()
            .success(true)
            .message("Incident updated successfully")
            .data(response)
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Delete an incident")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Incident deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<ApiStandardResponse<Void>> delete(@PathVariable Long id){
        incidentService.deleteIncident(id);
        return ResponseEntity.ok(ApiStandardResponse.<Void>builder()
            .success(true)
            .message("Incident deleted successfully")
            .timestamp(LocalDateTime.now())
            .build());
    }

    @GetMapping("/getincidents")
    @Operation(summary = "Get all incidents with pagination and search")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Incidents retrieved successfully")
    })
    public ResponseEntity<ApiStandardResponse<PageResponse<IncidentResponseDTO>>> getIncidents(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) Severity severity,
        @RequestParam(required = false) String title
    ){
        PageResponse<IncidentResponseDTO> incidents=incidentService.getIncidents(page, size, severity, title);
        ApiStandardResponse<PageResponse<IncidentResponseDTO>> apiresponse= ApiStandardResponse.<PageResponse<IncidentResponseDTO>>builder()
            .success(true)
            .message("Incidents retrieved successfully")
            .data(incidents)
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.ok(apiresponse);
    }
}
