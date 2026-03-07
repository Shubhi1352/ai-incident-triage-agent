package com.shubham.aitriage.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class IncidentResponseDTO implements Serializable {
    private Long id;
    private String title;
    private String description;
    private String errorLog;
    private Severity severity;
    private String rootCause;
    private String aiSuggestion;
    private Status status;
    private LocalDateTime createdAt;
}
