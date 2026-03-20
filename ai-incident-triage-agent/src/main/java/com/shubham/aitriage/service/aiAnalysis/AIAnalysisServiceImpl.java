package com.shubham.aitriage.service.aiAnalysis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AIAnalysisServiceImpl implements AIAnalysisService {
    private static final Logger log = LoggerFactory.getLogger(AIAnalysisServiceImpl.class);
    private final RestTemplate restTemplate;

    @Value("${ai.ollama.url}")
    private String ollamaUrl;

    @Override
    public AIAnalysisResponse analyzeIncident(String title, String description, String errorLog) throws JsonProcessingException {
        String prompt = """
            You are a precise triage AI assistant.

            Respond with **ONLY** valid JSON. No explanations, no markdown, no extra text.
            Do not write any words before or after the JSON object.

            Return JSON in this exact format:
            {
            "severity": "LOW | MEDIUM | HIGH | CRITICAL",
            "rootCause": "short explanation",
            "suggestion": "short fix recommendation"
            }

            Incident Details:
            Title: %s
            Description: %s
            Error Log: %s
            """.formatted(title, description, errorLog);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "phi3");
            body.put("prompt", prompt);
            body.put("stream", false);
            body.put("options", Map.of(
                "temperature", 0.1,
                "num_ctx", 2048,
                "top_p", 0.9,
                "top_k", 40
            ));

        Map response = restTemplate.postForObject(
            ollamaUrl + "/generate",
            body,
            Map.class
        );
        if(response == null || response.get("response")==null){
            throw new RuntimeException("AI service returned empty response");
        }
        try{
            ObjectMapper mapper = new ObjectMapper();

            String aiText = (String)response.get("response");
            log.info("Raw AI response: {}", aiText);
            int start = aiText.indexOf("{");
            int end = aiText.lastIndexOf("}");
            if(start == -1 || end <= start ){
                throw new RuntimeException("AI response does not contain valid JSON");
            }
            String json;
            if( end == -1 ){
                json = aiText.substring(start)+"}";
            } else {
                json = aiText.substring(start,end+1);
            }
            JsonNode node = mapper.readTree(json);
            AIAnalysisResponse aiResult = new AIAnalysisResponse();
            aiResult.setSeverity(node.has("severity") ? node.get("severity").asText() : "MEDIUM");
            aiResult.setRootCause(node.has("rootCause") ? node.get("rootCause").asText() : "Unknown cause");
            aiResult.setSuggestion(node.has("suggestion") ? node.get("suggestion").asText() : "Investigation logs");
            return aiResult;
        } catch (Exception e){
            log.error("AI Analysis failed for incident. Raw output: {}", response != null ? response.get("response") : "null", e);
            throw new RuntimeException("Failed to get valid analysis from AI", e);
        }
    }

}
