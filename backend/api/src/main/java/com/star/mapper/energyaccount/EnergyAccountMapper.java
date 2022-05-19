package com.star.mapper.energyaccount;

import com.star.dto.energyaccount.EnergyAccountDTO;
import com.star.models.energyaccount.EnergyAccount;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", uses = {EnergyAccountPointMapper.class}, unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface EnergyAccountMapper {

    EnergyAccountDTO beanToDto(EnergyAccount energyAccount);

    List<EnergyAccountDTO> beanToDtos(List<EnergyAccount> energyAccounts);
}

