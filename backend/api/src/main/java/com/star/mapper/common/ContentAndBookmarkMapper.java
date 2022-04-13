package com.star.mapper.common;

import com.star.dto.common.PageDTO;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.AfterMapping;
import org.mapstruct.MappingTarget;

import java.util.Collections;

public interface ContentAndBookmarkMapper<E> {

    public static final String NIL = "nil";

    @AfterMapping
    default void convertContentAndBookmark(@MappingTarget PageDTO<E> paginationResponse) {
        if (paginationResponse != null) {
            if (paginationResponse.getContent() == null) {
                paginationResponse.setContent(Collections.emptyList());
            }
            if (StringUtils.equalsIgnoreCase(paginationResponse.getBookmark(), NIL)) {
                paginationResponse.setBookmark(null);
            }
        }
    }
}
