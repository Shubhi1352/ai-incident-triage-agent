package com.shubham.aitriage.service.aiChat;

import com.shubham.aitriage.dto.AIChatResponse;
import com.shubham.aitriage.dto.ChatMessageDTO;
import com.shubham.aitriage.dto.PageResponse;

public interface AIChatService {
    public AIChatResponse chat(Long incidentId, String message);
    public PageResponse<ChatMessageDTO> getChatHistory(Long incidentId,int page, int size);
}
