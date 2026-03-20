package com.shubham.aitriage.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shubham.aitriage.dto.AIChatRequest;
import com.shubham.aitriage.dto.AIChatResponse;
import com.shubham.aitriage.service.aiChat.AIChatService;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import com.shubham.aitriage.dto.ApiStandardResponse;
import com.shubham.aitriage.dto.ChatMessageDTO;
import com.shubham.aitriage.dto.PageResponse;

import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai/chat")
@CrossOrigin(origins = "http://localhost:3000")
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

    @GetMapping("/{incidentId}/history")
    public ResponseEntity<ApiStandardResponse<PageResponse<ChatMessageDTO>>> getChatHistory(
            @PathVariable Long incidentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
        ){
        PageResponse<ChatMessageDTO> history = chatService.getChatHistory(incidentId, page, size);
        ApiStandardResponse<PageResponse<ChatMessageDTO>> response = ApiStandardResponse.<PageResponse<ChatMessageDTO>>builder()
            .success(true)
            .message("Chat history fetched successfully")
            .data(history)
            .timestamp(LocalDateTime.now())
            .build();
        
        return ResponseEntity.ok(response);
    }
}
