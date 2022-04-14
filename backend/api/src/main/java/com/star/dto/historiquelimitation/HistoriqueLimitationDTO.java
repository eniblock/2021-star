package com.star.dto.historiquelimitation;

import com.star.enums.TechnologyTypeEnum;
import com.star.rest.enums.TypeSiteEnum;
import lombok.Getter;
import lombok.Setter;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Getter
@Setter
public class HistoriqueLimitationDTO {

    private String meteringPointMrid;
    private TechnologyTypeEnum technologyType;
    private String producerMarketParticipantMrid;
    private String producerMarketParticipantName;
    private String siteName;
    private TypeSiteEnum typeSite;

}
