package com.shubham.aitriage.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PageResponse<T>{
    private List<T> items;
    private int currentPage;
    private int pageSize;  
    private long totalItems;
    private int totalPages;
}
