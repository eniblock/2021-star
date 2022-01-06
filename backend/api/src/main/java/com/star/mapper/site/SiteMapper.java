package com.star.mapper.site;

import com.star.dto.site.SiteDTO;
import com.star.enums.TechnologyTypeEnum;
import com.star.models.site.dso.SiteDso;
import com.star.models.site.tso.SiteTso;
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
public interface SiteMapper {


    @Mapping(target = "typeSite", source = "siteDso", qualifiedByName = "mapTypeSiteForSiteDso")
    @Mapping(target = "siteIecCode", source = "siteDso", qualifiedByName = "mapIecCodeForSiteDso")
    @Mapping(target = "systemOperatorMarketParticipantName", ignore = true)
    @Mapping(target = "technologyType", expression = "java(com.star.enums.TechnologyTypeEnum.fromValue(siteDso.getTechnologyType()))")
    SiteDTO beanDsoToDto(SiteDso siteDso);

    @Mapping(target = "typeSite", source = "siteTso", qualifiedByName = "mapTypeSiteForSiteTso")
    @Mapping(target = "technologyType", expression = "java(com.star.enums.TechnologyTypeEnum.fromValue(siteTso.getTechnologyType()))")
    SiteDTO beanTsoToDto(SiteTso siteTso);

    List<SiteDTO> beanDsoToDtos(List<SiteDso> siteDsos);

    List<SiteDTO> beanTsoToDtos(List<SiteTso> siteTsos);

    @Named("mapTypeSiteForSiteDso")
    default TypeSiteEnum mapTypeSiteForSiteDso(SiteDso siteDso) {
        return TypeSiteEnum.HTA;
    }

    @Named("mapIecCodeForSiteDso")
    default String mapIecCodeForSiteDso(SiteDso siteDso) {
        return null;
    }

    @Named("mapTypeSiteForSiteTso")
    default TypeSiteEnum mapTypeSiteForSiteTso(SiteTso siteTso) {
        return TypeSiteEnum.HTB;
    }

}
