package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class ReconciliationRepository {

    public static final String GET_ACTIVATION_DOCUMENT_RECONCILIATION_STATE = "GetActivationDocumentReconciliationState";
    public static final String UPDATE_ACTIVATION_DOCUMENT_BY_ORDERS = "UpdateActivationDocumentByOrders";


    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;


    public String getReconciliation() throws ContractException, JsonProcessingException {
        log.info("Appel de GetActivationDocumentReconciliationState pour obtenir l'état de la réconciliation");
       byte[] response = contract.evaluateTransaction(GET_ACTIVATION_DOCUMENT_RECONCILIATION_STATE);
       return response == null ? null : new String(response, StandardCharsets.UTF_8);
    }


    public void reconciliate() throws ContractException, TimeoutException, InterruptedException {
        log.info("Appel de reconciliate pour effectuer une réconciliation");
       byte[] evaluateTransaction = contract.evaluateTransaction(GET_ACTIVATION_DOCUMENT_RECONCILIATION_STATE);
       if (evaluateTransaction != null && evaluateTransaction.length > 2) {
           log.info("Lancement de la reconciliation");
           contract.submitTransaction(UPDATE_ACTIVATION_DOCUMENT_BY_ORDERS, new String(evaluateTransaction));
       }
    }
}
