package com.shubham.aitriage.dto;

import java.time.LocalDateTime;
import java.util.Map;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {
    private boolean success;
    private String message;
    private Map<String, String> errors;
    private LocalDateTime timestamp;
}
