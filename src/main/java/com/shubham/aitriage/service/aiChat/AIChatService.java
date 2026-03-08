package com.shubham.aitriage.service.aiChat;

import com.shubham.aitriage.dto.AIChatResponse;

public interface AIChatService {
    AIChatResponse chat(Long incidentId, String message);
}
