package com.star.dto.historiquelimitation;

import com.star.dto.energyamount.EnergyAmountDTO;
import com.star.dto.site.SiteDTO;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.producer.Producer;
import lombok.Getter;
import lombok.Setter;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Getter
@Setter
public class HistoriqueLimitationDTO {
    private SiteDTO site;
    private Producer producer;
    private EnergyAmountDTO energyAmount;
    private OrdreLimitation activationDocument;
    private OrdreLimitation[] subOrderList;
}