package com.shubham.aitriage.dto;

import com.shubham.aitriage.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IncidentProgressEventDTO {
    private Long incidentId;
    private Status status;
    private String message;
}
