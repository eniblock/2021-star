package com.star.mapper.historiquelimitation;

import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import com.star.models.site.Site;
import com.star.rest.enums.TypeSiteEnum;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface HistoriqueLimitationMapper {

    @Mapping(target = "typeSite", source = "historiqueLimitation", qualifiedByName = "mapTypeSite")
    @Mapping(target = "technologyType", expression = "java(com.star.enums.TechnologyTypeEnum.fromValue(historiqueLimitation.getTechnologyType()))")
    HistoriqueLimitationDTO beanToDto(HistoriqueLimitation historiqueLimitation);

    List<HistoriqueLimitationDTO> beanToDtos(List<HistoriqueLimitation> historiqueLimitations);

    @Named("mapTypeSite")
    default TypeSiteEnum mapTypeSiteForSite(HistoriqueLimitation historiqueLimitation) {
        return Site.isSiteHTA(historiqueLimitation.getMeteringPointMrid()) ? TypeSiteEnum.HTA : TypeSiteEnum.HTB;
    }


}
