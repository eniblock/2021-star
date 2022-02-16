package com.star.dto.site;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteDTOResponse {
    private List<SiteDTO> content;
    private int totalElements;
    private String bookmark;

    public List<SiteDTO> getContent() {
        return content;
    }

    public void setContent(List<SiteDTO> content) {
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
