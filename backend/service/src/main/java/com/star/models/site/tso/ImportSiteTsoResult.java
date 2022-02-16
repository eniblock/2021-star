package com.star.models.site.tso;

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
public class ImportSiteTsoResult implements ImportResult<SiteTso> {

    List<SiteTso> datas = new ArrayList<>();
    List<String> errors = new ArrayList<>();

    @Override
    public List<SiteTso> getDatas() {
        return datas;
    }

    @Override
    public void setDatas(List<SiteTso> siteTsos) {
        this.datas = siteTsos;
    }

    @Override
    public List<String> getErrors() {
        return errors;
    }

}
