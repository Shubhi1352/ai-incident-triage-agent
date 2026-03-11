package com.shubham.aitriage.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AIChatResponse {
    private String answer;
}
