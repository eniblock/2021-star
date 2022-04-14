package com.star.models.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginationDto {
    private int page;
    private int pageSize;
    private String order;
    private OrderDirection orderDirection;
}
