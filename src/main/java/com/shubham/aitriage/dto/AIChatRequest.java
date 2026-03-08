package com.shubham.aitriage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIChatRequest {
    @NotBlank
    private String message;
}
