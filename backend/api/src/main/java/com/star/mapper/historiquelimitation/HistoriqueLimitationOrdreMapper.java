package com.star.mapper.historiquelimitation;

import com.star.dto.historiquelimitation.HistoriqueLimitationOrdreDTO;
import com.star.models.limitation.OrdreLimitation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface HistoriqueLimitationOrdreMapper {

    @Mapping(target = "motif", expression = "java(com.star.dto.common.MotifDTO.builder().messageType(ordreLimitation.getMessageType()).businessType(ordreLimitation.getBusinessType()).reasonCode(ordreLimitation.getReasonCode()).build())")
    @Mapping(target = "quantity", expression = "java(123)")
    HistoriqueLimitationOrdreDTO beanToDto(OrdreLimitation ordreLimitation);

}
