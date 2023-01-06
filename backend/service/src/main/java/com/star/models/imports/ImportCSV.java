package com.star.models.imports;

import org.apache.commons.csv.CSVRecord;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public interface ImportCSV {
    List<String> getHeaders();

    void defineData(CSVRecord csvRecord);
}
