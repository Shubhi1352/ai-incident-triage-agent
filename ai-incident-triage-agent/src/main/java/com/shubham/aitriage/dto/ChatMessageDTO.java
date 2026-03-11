package com.shubham.aitriage.dto;

import java.time.LocalDateTime;

import com.shubham.aitriage.enums.ChatRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {

    private ChatRole role;
    private String message;
    private LocalDateTime createdAt;
}
