package com.star.mapper.energyamount;

import com.star.dto.energyamount.EnergyAmountDTO;
import com.star.dto.energyamount.EnergyAmountFormDTO;
import com.star.models.energyamount.EnergyAmount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface EnergyAmountMapper {

    EnergyAmountDTO beanToDto(EnergyAmount energyAmount);

    @Mapping(target = "docType", ignore = true)
    @Mapping(target = "energyAmountMarketDocumentMrid", ignore = true)
    @Mapping(target = "registeredResourceMrid", ignore = true)
    @Mapping(target = "docStatus", ignore = true)
    @Mapping(target = "areaDomain", ignore = true)
    @Mapping(target = "senderMarketParticipantMrid", ignore = true)
    @Mapping(target = "senderMarketParticipantRole", ignore = true)
    @Mapping(target = "receiverMarketParticipantMrid", ignore = true)
    @Mapping(target = "receiverMarketParticipantRole", ignore = true)
    @Mapping(target = "createdDateTime", ignore = true)
    EnergyAmount formDtoToBean(EnergyAmountFormDTO energyAmountFormDTO);

    List<EnergyAmountDTO> beanToDtos(List<EnergyAmount> energyAmounts);
}

