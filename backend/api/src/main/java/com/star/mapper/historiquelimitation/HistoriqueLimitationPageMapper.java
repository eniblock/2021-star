package com.star.mapper.historiquelimitation;

import com.star.dto.common.PageDTO;
import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.dto.site.SiteDTO;
import com.star.mapper.common.ContentAndBookmarkMapper;
import com.star.models.common.PageHLF;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.LinkedList;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR, uses = {HistoriqueLimitationMapper.class})
public abstract class HistoriqueLimitationPageMapper implements ContentAndBookmarkMapper<SiteDTO> {

    @Autowired
    private HistoriqueLimitationMapper HISTORIQUE_LIMITATION_MAPPER;

    @Mapping(target = "content", source = "records")
    @Mapping(target = "totalElements", source = "fetchedRecordsCount")
    public abstract PageDTO<HistoriqueLimitationDTO> beanToDto(PageHLF<HistoriqueLimitation> pageHLF);

}
