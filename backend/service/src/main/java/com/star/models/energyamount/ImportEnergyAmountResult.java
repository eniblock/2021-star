package com.star.models.energyamount;

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
public class ImportEnergyAmountResult {

    private List<EnergyAmount> datas = new ArrayList<>();
    private List<String> errors = new ArrayList<>();

}
