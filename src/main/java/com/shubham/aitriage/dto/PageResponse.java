package com.shubham.aitriage.dto;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> implements Serializable{
    private List<T> items;
    private int currentPage;
    private int pageSize;  
    private long totalItems;
    private int totalPages;
}
