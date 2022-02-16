package com.star.models.producer;

import com.star.models.imports.ImportResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportProducerResult implements ImportResult<Producer> {

    List<Producer> datas = new ArrayList<>();
    List<String> errors = new ArrayList<>();

    @Override
    public List<Producer> getDatas() {
        return datas;
    }

    @Override
    public void setDatas(List<Producer> producers) {
        this.datas = producers;
    }

    @Override
    public List<String> getErrors() {
        return errors;
    }

}
