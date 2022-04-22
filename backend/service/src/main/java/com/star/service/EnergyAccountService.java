package com.star.service;

import com.star.enums.InstanceEnum;
import com.star.models.common.FichierImportation;
import com.star.models.energyaccount.ImportEnergyAccountResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class EnergyAccountService {

    public ImportEnergyAccountResult importFichiers(List<FichierImportation> fichiers, InstanceEnum instance) {
        return new ImportEnergyAccountResult();
    }
}
