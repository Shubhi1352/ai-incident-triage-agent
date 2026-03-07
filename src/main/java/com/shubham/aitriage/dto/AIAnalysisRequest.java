package com.shubham.aitriage.dto;

import lombok.Data;

@Data
public class AIAnalysisRequest {
    private String title;
    private String description;
    private String errorLog;
}
