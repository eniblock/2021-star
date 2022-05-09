package com.star.mapper.energyaccount;

import com.star.dto.common.PageDTO;
import com.star.dto.energyaccount.EnergyAccountDTO;
import com.star.mapper.common.ContentAndBookmarkMapper;
import com.star.models.common.PageHLF;
import com.star.models.energyaccount.EnergyAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR, uses = {EnergyAccountMapper.class})
public interface EnergyAccountPageMapper extends ContentAndBookmarkMapper<EnergyAccountDTO> {

    @Mapping(target = "content", source = "records")
    @Mapping(target = "totalElements", source = "fetchedRecordsCount")
    PageDTO<EnergyAccountDTO> beanToDto(PageHLF<EnergyAccount> pageHLF);
}
