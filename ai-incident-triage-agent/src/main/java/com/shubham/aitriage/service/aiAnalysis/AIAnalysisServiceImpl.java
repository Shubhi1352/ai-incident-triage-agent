package com.shubham.aitriage.service.aiAnalysis;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shubham.aitriage.dto.AIAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpHeaders;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class AIAnalysisServiceImpl implements AIAnalysisService {
    private static final Logger log = LoggerFactory.getLogger(AIAnalysisServiceImpl.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.huggingface.url}")
    private String url;

    @Value("${ai.huggingface.model}")
    private String model;

    @Value("${ai.huggingface.token}")
    private String token;

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

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.add("X-Huggingface-Client", "openai");
        headers.add("Accept", "application/json");

        Map<String, Object> body = Map.of(
            "model", model,
            "temperature", 0.1,
            "max_tokens", 1024,
            "messages", List.of(
                Map.of("role", "user", "content", prompt)
            )
        );

        String response = restTemplate.postForObject(
            url,
            new HttpEntity<>(body, headers),
            String.class
        );
        if(response == null ){
            throw new RuntimeException("AI service returned empty response");
        }
        try{
            JsonNode root = objectMapper.readTree(response);

            String aiText = root
                .get("choices")
                .get(0)
                .get("message")
                .get("content")
                .asText()
                .trim();

            log.info("Raw AI response: {}", aiText);

            int start = aiText.indexOf("{");
            int end = aiText.lastIndexOf("}");

            if (start == -1 || end <= start) {
                throw new RuntimeException("AI response does not contain valid JSON");
            }

            String json = aiText.substring(start, end + 1);

            JsonNode node = objectMapper.readTree(json);

            AIAnalysisResponse aiResult = new AIAnalysisResponse();
            aiResult.setSeverity(node.has("severity") ? node.get("severity").asText() : "MEDIUM");
            aiResult.setRootCause(node.has("rootCause") ? node.get("rootCause").asText() : "Unknown cause");
            aiResult.setSuggestion(node.has("suggestion") ? node.get("suggestion").asText() : "Check logs");

            return aiResult;

        } catch (Exception e){
            log.error("AI Analysis failed for incident. Raw output: {}", response != null ? response : "null", e);
            AIAnalysisResponse fallback = new AIAnalysisResponse();
            fallback.setSeverity("MEDIUM");
            fallback.setRootCause("AI unavailable");
            fallback.setSuggestion("Check logs manually");

            return fallback;
        }
    }

}
