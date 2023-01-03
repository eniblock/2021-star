package com.star.mapper.reservebid;

import com.star.dto.reservebid.ReserveBidCreationDTO;
import com.star.dto.reservebid.ReserveBidDTO;
import com.star.models.reservebid.ReserveBid;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ReserveBidMapper {
    @Mapping(target = "docType", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "attachmentsWithStatus", ignore = true)
    ReserveBid dtoToBean(ReserveBidDTO reserveBidDTO);

    @Mapping(target = "docType", ignore = true)
    @Mapping(target = "reserveBidMrid", ignore = true)
    @Mapping(target = "revisionNumber", ignore = true)
    @Mapping(target = "messageType", ignore = true)
    @Mapping(target = "processType", ignore = true)
    @Mapping(target = "senderMarketParticipantMrid", ignore = true)
    @Mapping(target = "receiverMarketParticipantMrid", ignore = true)
    @Mapping(target = "createdDateTime", ignore = true)
    @Mapping(target = "validityPeriodEndDateTime", ignore = true)
    @Mapping(target = "businessType", ignore = true)
    @Mapping(target = "quantityMeasureUnitName", ignore = true)
    @Mapping(target = "priceMeasureUnitName", ignore = true)
    @Mapping(target = "currencyUnitName", ignore = true)
    @Mapping(target = "flowDirection", ignore = true)
    @Mapping(target = "reserveBidStatus", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "attachmentsWithStatus", ignore = true)
    ReserveBid dtoToBean(ReserveBidCreationDTO reserveBidCreationDTO);

    ReserveBidDTO beanToDto(ReserveBid reserveBid);

    List<ReserveBidDTO> beansToDtos(List<ReserveBid> reserveBids);
}

