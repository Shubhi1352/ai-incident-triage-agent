package com.shubham.aitriage.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.shubham.aitriage.service.aiAnalysis.AIAnalysisService;
import com.shubham.aitriage.dto.AIAnalysisRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

//for testing only
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final AIAnalysisService aiAnalysisService;

    @PostMapping("/analyze")
    public AIAnalysisResponse analyze(@RequestBody AIAnalysisRequest request) throws JsonProcessingException {
        AIAnalysisResponse result = aiAnalysisService.analyzeIncident(
                request.getTitle(),
                request.getDescription(),
                request.getErrorLog()
        );
        return result;
    }
    

}
