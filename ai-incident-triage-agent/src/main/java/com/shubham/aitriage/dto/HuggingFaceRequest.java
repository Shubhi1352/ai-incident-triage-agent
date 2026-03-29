package com.shubham.aitriage.dto;

import lombok.Data;

@Data
public class HuggingFaceRequest {
    private String inputs;

    public HuggingFaceRequest(String inputs) {
        this.inputs = inputs;
    }

    public String getInputs() {
        return inputs;
    }
}
