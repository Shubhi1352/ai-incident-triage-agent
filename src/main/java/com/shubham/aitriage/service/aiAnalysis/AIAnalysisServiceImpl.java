package com.shubham.aitriage.service.aiAnalysis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.shubham.aitriage.enums.Severity;
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
            You are an incident triage AI assistant.

            Return ONLY valid JSON.
            The JSON must be complete and syntactically correct.

            Respond exactly in this format:

            {
            "severity": "LOW | MEDIUM | HIGH | CRITICAL",
            "rootCause": "short explanation",
            "suggestion": "short fix recommendation"
            }

            Do not add text before or after JSON.

            Incident:
            Title: %s
            Description: %s
            Error Log: %s
            """.formatted(title, description, errorLog);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "llama3");
            body.put("prompt", prompt);
            body.put("stream", false);

            Map response = restTemplate.postForObject(
                ollamaUrl + "/generate",
                body,
                Map.class
            );
            if(response == null || response.get("response")==null){
                throw new RuntimeException("AI service returned empty response");
            }

            ObjectMapper mapper = new ObjectMapper();

            String aiText = (String)response.get("response");
            log.info("Raw AI response: {}", aiText);
            int start = aiText.indexOf("{");
            int end = aiText.lastIndexOf("}");
            if(start == -1){
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
    }

}
