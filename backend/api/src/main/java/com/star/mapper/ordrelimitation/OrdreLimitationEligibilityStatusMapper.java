package com.star.mapper.ordrelimitation;

import com.star.dto.ordrelimitation.OrdreLimitationEligibilityStatusDTO;
import com.star.models.limitation.OrdreLimitationEligibilityStatus;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface OrdreLimitationEligibilityStatusMapper {
    OrdreLimitationEligibilityStatusDTO beanToDto(OrdreLimitationEligibilityStatus ordreLimitationEligibilityStatus);
    @InheritInverseConfiguration
    OrdreLimitationEligibilityStatus dtoToBean(OrdreLimitationEligibilityStatusDTO ordreLimitationEligibilityStatusDTO);
}