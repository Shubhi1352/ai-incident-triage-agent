package com.shubham.aitriage.service.aiChat;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shubham.aitriage.dto.AIChatResponse;
import com.shubham.aitriage.dto.ChatMessageDTO;
import com.shubham.aitriage.dto.PageResponse;
import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.entity.IncidentChat;
import com.shubham.aitriage.enums.ChatRole;
import com.shubham.aitriage.exception.ResourceNotFoundException;
import com.shubham.aitriage.repository.IncidentChatRepository;
import com.shubham.aitriage.repository.IncidentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AIChatServiceImpl implements AIChatService{

    @Value("${ai.huggingface.url}")
    private String url;

    @Value("${ai.huggingface.token}")
    private String token;

    @Value("${ai.huggingface.model}")
    private String model;

    private final IncidentRepository incidentRepository;
    private final IncidentChatRepository chatRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private ChatMessageDTO mapChatMessageDTO(IncidentChat incidentChat){
        return ChatMessageDTO.builder()
            .role(incidentChat.getRole())
            .message(incidentChat.getMessage())
            .createdAt(incidentChat.getCreatedAt())
            .build();
    }

    @Override
    public AIChatResponse chat(Long incidentId, String message){
        Incident incident = incidentRepository.findById(incidentId)
            .orElseThrow(()->new ResourceNotFoundException("Incident not found"));

        chatRepository.save(IncidentChat.builder()
            .incidentId(incidentId)
            .role(ChatRole.USER)
            .message(message)
            .createdAt(LocalDateTime.now())
            .build()
        );

        List<IncidentChat> history = chatRepository.findTop5ByIncidentIdOrderByCreatedAtAsc(incidentId);

        String systemPrompt = """
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
            """.formatted(
                incident.getTitle(),
                incident.getDescription(),
                incident.getErrorLog(),
                incident.getRootCause(),
                incident.getAiSuggestion()
            );

        // ✅ New proper messages format
        var messages = new java.util.ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));

        for(IncidentChat chat : history){
            messages.add(Map.of(
                "role", chat.getRole() == ChatRole.USER ? "user" : "assistant",
                "content", chat.getMessage()
            ));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.add("X-Huggingface-Client", "openai");
        headers.add("Accept", "application/json");

        Map<String, Object> body = Map.of(
            "model", model,
            "temperature", 0.7,
            "max_tokens", 1024,
            "messages", messages
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // ✅ Correct URL, no model appended
        String response = restTemplate.postForObject(
            url,
            request,
            String.class
        );

        if (response == null || response.isEmpty()) {
            throw new RuntimeException("AI returned empty response");
        }

        try {
            // ✅ Correct response parsing
            JsonNode root = objectMapper.readTree(response);
            String aiText = root
                .get("choices")
                .get(0)
                .get("message")
                .get("content")
                .asText()
                .trim();

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

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    @Override
    public PageResponse<ChatMessageDTO> getChatHistory(Long incidentId,int page,int size){
        incidentRepository.findById(incidentId).orElseThrow(()->new ResourceNotFoundException("Incident not found"));
        Pageable pageable = PageRequest.of(page,size,Sort.by("createdAt").descending());
        Page<IncidentChat> chats = chatRepository.findByIncidentId(incidentId, pageable);
        List<ChatMessageDTO> items = chats.getContent()
            .stream()
            .map(this::mapChatMessageDTO)
            .toList();
  
        return PageResponse.<ChatMessageDTO>builder()
            .items(items)
            .currentPage(chats.getNumber())
            .pageSize(chats.getSize())
            .totalItems(chats.getTotalElements())
            .totalPages(chats.getTotalPages())
            .build();       
    }
}
