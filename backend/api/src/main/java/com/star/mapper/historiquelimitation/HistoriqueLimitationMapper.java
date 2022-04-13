package com.star.mapper.historiquelimitation;

import com.star.dto.historiquelimitation.HistoriqueLimitationDTO;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface HistoriqueLimitationMapper {

    HistoriqueLimitationDTO beanToDto(HistoriqueLimitation site);

    List<HistoriqueLimitationDTO> beanToDtos(List<HistoriqueLimitation> sites);

}
