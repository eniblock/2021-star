package com.star.models.site;

import com.star.enums.InstanceEnum;
import com.star.enums.TechnologyTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteCrteria {
    private String siteName;
    private String substationName;
    private String substationMrid;
    private String producerMarketParticipantName;
    private String producerMarketParticipantMrid;
    private String siteIecCode;
    private String meteringPointMrId;
    private InstanceEnum instance;
    private List<TechnologyTypeEnum> technologyType;
}
