package com.star.mapper.site;

import com.star.dto.common.PageDTO;
import com.star.dto.site.SiteDTO;
import com.star.mapper.common.ContentAndBookmarkMapper;
import com.star.models.common.PageHLF;
import com.star.models.site.Site;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR, uses = {SiteMapper.class})
public interface SitePageMapper extends ContentAndBookmarkMapper<SiteDTO> {

    @Mapping(target = "content", source = "records")
    @Mapping(target = "totalElements", source = "fetchedRecordsCount")
    PageDTO<SiteDTO> beanToDto(PageHLF<Site> pageHLF);

}
