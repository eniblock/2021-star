package com.star.models.historiquelimitation;

import com.star.models.energyamount.EnergyAmount;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.producer.Producer;
import com.star.models.site.Site;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoriqueLimitation {
    private String displayedSourceName;
    private Site site;
    private Producer producer;
    private EnergyAmount energyAmount;
    private OrdreLimitation activationDocument;
    private OrdreLimitation[] subOrderList;
}