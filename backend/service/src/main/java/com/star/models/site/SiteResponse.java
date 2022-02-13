package com.star.models.site;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteResponse {
    private List<Site> records;
    private int fetchedRecordsCount;
    private String bookmark;
}
