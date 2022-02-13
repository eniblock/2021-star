package com.star.mapper.site;

import com.star.dto.site.SiteDTO;
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
public interface SiteMapper {


    @Mapping(target = "typeSite", source = "site", qualifiedByName = "mapTypeSiteForSite")
    @Mapping(target = "siteIecCode", source = "site", qualifiedByName = "mapIecCodeForSite")
    @Mapping(target = "systemOperatorMarketParticipantName", ignore = true)
    @Mapping(target = "technologyType", expression = "java(com.star.enums.TechnologyTypeEnum.fromValue(site.getTechnologyType()))")
    SiteDTO beanToDto(Site site);

//    @Mapping(target = "typeSite", source = "siteTso", qualifiedByName = "mapTypeSiteForSiteTso")
//    @Mapping(target = "technologyType", expression = "java(com.star.enums.TechnologyTypeEnum.fromValue(siteTso.getTechnologyType()))")
//    SiteDTO beanTsoToDto(Site site);

    List<SiteDTO> beanTsoToDtos(List<Site> sites);

    @Named("mapTypeSiteForSite")
    default TypeSiteEnum mapTypeSiteForSite(Site site) {
        return TypeSiteEnum.HTA;
    }

    @Named("mapIecCodeForSite")
    default String mapIecCodeForSite(Site site) {
        return null;
    }

//    @Named("mapTypeSiteForSiteTso")
//    default TypeSiteEnum mapTypeSiteForSiteTso(Site site) {
//        return TypeSiteEnum.HTB;
//    }

}
