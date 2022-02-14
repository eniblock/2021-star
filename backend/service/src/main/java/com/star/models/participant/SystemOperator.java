package com.star.models.participant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemOperator {
    private String systemOperatorMarketParticipantMrid;
    private String systemOperatorMarketParticipantName;
    private String systemOperatorMarketParticipantRoleType;
}