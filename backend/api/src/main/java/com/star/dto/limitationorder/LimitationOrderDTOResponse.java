package com.star.dto.limitationorder;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class LimitationOrderDTOResponse {
    private List<LimitationOrderDTO> content;
    private int totalElements;
    private String bookmark;

    public List<LimitationOrderDTO> getContent() {
        return content;
    }

    public void setContent(List<LimitationOrderDTO> content) {
        this.content = content;
    }

    public int getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(int totalElements) {
        this.totalElements = totalElements;
    }

    public String getBookmark() {
        return bookmark;
    }

    public void setBookmark(String bookmark) {
        this.bookmark = bookmark;
    }
}
