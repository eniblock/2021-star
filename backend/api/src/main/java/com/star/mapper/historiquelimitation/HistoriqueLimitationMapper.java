package com.star.mapper.historiquelimitation;

import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.mapper.energyamount.EnergyAmountMapper;
import com.star.mapper.reservebid.ReserveBidMapper;
import com.star.mapper.site.SiteMapper;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR,
        uses = {SiteMapper.class, EnergyAmountMapper.class, ReserveBidMapper.class, BalancingDocumentMapper.class})
public interface HistoriqueLimitationMapper {

    HistoriqueLimitationDTO beanToDto(HistoriqueLimitation historiqueLimitation);

    List<HistoriqueLimitationDTO> beanToDtos(List<HistoriqueLimitation> historiqueLimitations);

    HistoriqueLimitationDTO[] beanToDtos(HistoriqueLimitation[] historiqueLimitations);

}
