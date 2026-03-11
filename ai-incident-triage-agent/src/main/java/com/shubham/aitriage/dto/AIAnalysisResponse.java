package com.shubham.aitriage.dto;

import lombok.Data;

@Data
public class AIAnalysisResponse {
    private String severity;
    private String rootCause;
    private String suggestion;
}
