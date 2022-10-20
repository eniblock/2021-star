package com.star.mapper.reservebid;

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

    ReserveBidDTO beanToDto(ReserveBid reserveBid);

    List<ReserveBidDTO> beansToDtos(List<ReserveBid> reserveBids);
}

