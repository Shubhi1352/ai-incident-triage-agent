package com.shubham.aitriage.dto;

import com.shubham.aitriage.entity.Incident;
import com.shubham.aitriage.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IncidentWSMessage {
    private Status status;
    private String message;
    private Incident incident;
}
