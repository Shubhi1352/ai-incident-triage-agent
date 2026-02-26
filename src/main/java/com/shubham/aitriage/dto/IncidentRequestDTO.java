package com.shubham.aitriage.dto;

import com.shubham.aitriage.enums.Severity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class IncidentRequestDTO {
    @NotBlank(message = "Title is mandatory")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;
    @NotBlank(message = "Description is mandatory")
    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;
    @NotNull(message = "Severity is mandatory")
    private Severity severity;
}
