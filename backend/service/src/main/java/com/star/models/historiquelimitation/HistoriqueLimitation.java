package com.star.models.historiquelimitation;

import com.star.models.limitation.OrdreLimitation;
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

    private String meteringPointMrid;
    private String technologyType;
    private String producerMarketParticipantMrid;
    private String producerMarketParticipantName;
    private String siteName;
    private OrdreLimitation ordreLimitationEnedis;
    private OrdreLimitation ordreLimitationRte;

}