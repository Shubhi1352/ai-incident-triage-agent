package com.shubham.aitriage.service.aiAnalysis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.shubham.aitriage.dto.AIAnalysisResponse;

public interface AIAnalysisService {
    public AIAnalysisResponse analyzeIncident(String title,String description, String errorLog) throws JsonProcessingException;
}
