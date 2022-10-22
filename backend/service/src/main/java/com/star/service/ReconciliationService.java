package com.star.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.repository.ReconciliationRepository;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class ReconciliationService {

    @Autowired
    private ReconciliationRepository reconciliationRepository;

    public String getReconciliation() throws JsonProcessingException, ContractException {
        return reconciliationRepository.getReconciliation();
    }

    public void reconciliate() throws ContractException, TimeoutException, InterruptedException {
        reconciliationRepository.reconciliate();
    }
}
