package com.shubham.aitriage.dto;

import java.time.LocalDateTime;
import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class IncidentResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Severity severity;
    private Status status;
    private LocalDateTime createdAt;
}
