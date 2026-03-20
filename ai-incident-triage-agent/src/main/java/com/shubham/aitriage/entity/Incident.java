package com.shubham.aitriage.entity;

import java.time.LocalDateTime;

import com.shubham.aitriage.enums.Severity;
import com.shubham.aitriage.enums.Status;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(length = 2000)
    private String description;
    @Column(length = 2000)
    private String errorLog;
    @Enumerated(EnumType.STRING)
    private Severity severity;
    private String rootCause;
    private String aiSuggestion;
    @Enumerated(EnumType.STRING)
    private Status status;
    private LocalDateTime createdAt;
}
