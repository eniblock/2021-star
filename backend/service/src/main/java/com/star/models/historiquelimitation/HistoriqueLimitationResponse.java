package com.star.models.historiquelimitation;

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
public class HistoriqueLimitationResponse {
    protected List<HistoriqueLimitation> records;
    protected int fetchedRecordsCount;
    protected String bookmark;
}
