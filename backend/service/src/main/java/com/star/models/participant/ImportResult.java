package com.star.models.participant;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */

public interface ImportResult<T extends ImportCSV> {
    List<T> getDatas();
    void setDatas(List<T> importBeans);
    List<String> getErrors();
}
