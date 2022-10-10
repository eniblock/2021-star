package com.star.models.energyaccount;

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
public class EnergyAccountCriteria {
    private String meteringPointMrid;
    private String startCreatedDateTime;
    private String endCreatedDateTime;
    private String producerMarketParticipantMrid;
}
