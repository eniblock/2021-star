package com.star.mapper.energyaccount;

import com.star.dto.energyaccount.EnergyAccountPointDTO;
import com.star.models.energyaccount.EnergyAccountPoint;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface EnergyAccountPointMapper {

    EnergyAccountPointDTO beanToDto(EnergyAccountPoint energyAccountPoint);

    List<EnergyAccountPointDTO> beanToDtos(List<EnergyAccountPoint> sites);

}
