package com.star.dto.site;

import com.star.enums.TechnologyTypeEnum;
import lombok.Getter;
import lombok.Setter;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Getter
@Setter
public class SiteDTO {

    private String typeSite;
    private String systemOperatorMarketParticipantMrid;
    private TechnologyTypeEnum technologyType;
    private String siteType;
    private String meteringPointMrid;
    private String siteName;
    private String siteAdminMrid;
    private String siteLocation;
    private String siteIecCode;
    private String producerMarketParticipantMrid;
    private String producerMarketParticipantName;
    private String substationMrid;
    private String substationName;
    private String systemOperatorEntityFlexibilityDomainMrid;
    private String systemOperatorEntityFlexibilityDomainName;
    private String systemOperatorCustomerServiceName;
    private String systemOperatorMarketParticipantName;
}
