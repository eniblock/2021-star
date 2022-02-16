package com.star.mapper.site;

import com.star.dto.site.SiteDTOResponse;
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
public abstract class SiteResponseMapper {

    private static final String NIL = "nil";

    @Mapping(target = "content", source = "records")
    @Mapping(target = "totalElements", source = "fetchedRecordsCount")
    public abstract SiteDTOResponse beanToDto(SiteResponse siteResponse);

    @AfterMapping
    protected void convertContentAndBookmark(@MappingTarget SiteDTOResponse siteDTOResponse) {
        if (siteDTOResponse != null) {
            if (siteDTOResponse.getContent() == null) {
                siteDTOResponse.setContent(Collections.emptyList());
            }
            if (StringUtils.equalsIgnoreCase(siteDTOResponse.getBookmark(), NIL)) {
                siteDTOResponse.setBookmark(null);
            }
        }
    }

}
