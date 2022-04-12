package com.star.mapper.site;

import com.star.dto.common.PageResponseDTO;
import com.star.dto.site.SiteDTO;
import com.star.models.site.SiteResponse;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.Collections;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR, uses = {SiteMapper.class})
public interface SitePageMapper {

    public static final String NIL = "nil";

    @Mapping(target = "content", source = "records")
    @Mapping(target = "totalElements", source = "fetchedRecordsCount")
    PageResponseDTO<SiteDTO> beanToDto(SiteResponse siteResponse);

    @AfterMapping
    default void convertContentAndBookmark(@MappingTarget PageResponseDTO<SiteDTO> paginationResponse) {
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
