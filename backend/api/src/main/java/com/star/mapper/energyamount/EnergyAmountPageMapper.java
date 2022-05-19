package com.star.mapper.energyamount;

import com.star.dto.common.PageDTO;
import com.star.dto.energyamount.EnergyAmountDTO;
import com.star.mapper.common.ContentAndBookmarkMapper;
import com.star.models.common.PageHLF;
import com.star.models.energyamount.EnergyAmount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR, uses = {EnergyAmountMapper.class})
public interface EnergyAmountPageMapper extends ContentAndBookmarkMapper<EnergyAmountDTO> {

    @Mapping(target = "content", source = "records")
    @Mapping(target = "totalElements", source = "fetchedRecordsCount")
    PageDTO<EnergyAmountDTO> beanToDto(PageHLF<EnergyAmount> pageHLF);
}
