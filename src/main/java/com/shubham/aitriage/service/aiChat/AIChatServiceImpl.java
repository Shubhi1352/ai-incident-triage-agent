package com.shubham.aitriage.service.aiChat;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import com.shubham.aitriage.dto.AIChatResponse;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.entity.IncidentChat;
import com.shubham.aitriage.enums.ChatRole;
import com.shubham.aitriage.repository.IncidentChatRepository;
import com.shubham.aitriage.repository.IncidentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AIChatServiceImpl implements AIChatService{

    @Value("${ai.ollama.url}")
    private String ollamaUrl;

    private final IncidentRepository incidentRepository;
    private final IncidentChatRepository chatRepository;
    private final RestTemplate restTemplate;

    @Override
    public AIChatResponse chat(Long incidentId, String message){
        Incident incident = incidentRepository.findById(incidentId)
            .orElseThrow(()->new RuntimeException("Incident not found"));

        chatRepository.save(IncidentChat.builder()
            .incidentId(incidentId)
            .role(ChatRole.USER)
            .message(message)
            .createdAt(LocalDateTime.now())
            .build()
        );

        List<IncidentChat> history = chatRepository.findTop5ByIncidentIdOrderByCreatedAtAsc(incidentId);

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
            You are a senior backend engineer and DevOps assistant.

            Your job is to help developers debug production incidents.

            Rules:
            - Give practical debugging steps
            - Suggest possible code fixes
            - Refer to the specific error log
            - If possible provide code snippets
            - Be concise and technical
            - Keep responses under 150 words

            Incident Details:
            Title: %s
            Description: %s
            Error Log: %s
            Root Cause: %s
            AI Suggested Fix: %s

            Conversation:
            """.formatted(
                incident.getTitle(),
                incident.getDescription(),
                incident.getErrorLog(),
                incident.getRootCause(),
                incident.getAiSuggestion()
            )
        );

        for(IncidentChat chat : history){
            prompt.append(chat.getRole())
                .append(": ")
                .append(chat.getMessage())
                .append("\n");
        }
        prompt.append("AI:");
        Map<String, Object> body = new HashMap<>();
        body.put("model","llama3");
        body.put("prompt", prompt.toString());
        body.put("stream",false);

        Map response = restTemplate.postForObject(
            ollamaUrl+"/generate", body, Map.class);
        String aiText = (String)response.get("response");
        chatRepository.save(
            IncidentChat.builder()
                .incidentId(incidentId)
                .role(ChatRole.AI)
                .message(aiText)
                .createdAt(LocalDateTime.now())
                .build()
        );
        return AIChatResponse.builder()
            .answer(aiText)
            .build();
    }
}
