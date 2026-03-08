package com.shubham.aitriage.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shubham.aitriage.dto.AIChatRequest;
import com.shubham.aitriage.dto.AIChatResponse;
import com.shubham.aitriage.service.aiChat.AIChatService;

import jakarta.validation.Valid;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import com.shubham.aitriage.dto.ApiStandardResponse;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
public class AIChatController {

    private final AIChatService chatService;

    @PostMapping("/{incidentId}")
    public ResponseEntity<ApiStandardResponse<AIChatResponse>> chat(@PathVariable Long incidentId,@Valid @RequestBody AIChatRequest request){
        AIChatResponse response = chatService.chat(incidentId,request.getMessage());
        ApiStandardResponse<AIChatResponse> apiResponse = ApiStandardResponse.<AIChatResponse>builder()
            .success(true)
            .message("AI response generated successfully")
            .data(response)
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.ok(apiResponse);
    }
}
