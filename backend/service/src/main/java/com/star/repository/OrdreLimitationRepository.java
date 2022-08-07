package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationEligibilityStatus;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeoutException;

import static java.util.Collections.emptyList;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class OrdreLimitationRepository {
    public static final String CREATE_LIST = "CreateActivationDocumentList";
    public static final String GET_ORDER_BY_QUERY = "GetActivationDocumentByQuery";
    public static final String GET_BY_QUERY = "GetActivationDocumentByQuery";
    public static final String GET_ACTIVATION_DOCUMENT_RECONCILIATION_STATE = "GetActivationDocumentReconciliationState";
    public static final String UPDATE_ACTIVATION_DOCUMENT_BY_ORDERS = "UpdateActivationDocumentByOrders";
    public static final String UPDATE_ACTIVATION_DOCUMENT_ELIGIBILITY_STATUS = "UpdateActivationDocumentEligibilityStatus";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les ordres de limitation dans la blockchain
     *
     * @param ordreLimitations liste des ordres de limitation à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public List<OrdreLimitation> saveOrdreLimitations(List<OrdreLimitation> ordreLimitations) throws BusinessException, TechnicalException {
        if (CollectionUtils.isEmpty(ordreLimitations)) {
            return emptyList();
        }
        log.info("Sauvegarde des ordres de limitation : {}", ordreLimitations);
        try {
            contract.submitTransaction(CREATE_LIST, objectMapper.writeValueAsString(ordreLimitations));
            this.reconciliate();
        } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de création de l'ordre de limitation ", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return ordreLimitations;
    }

    public List<OrdreLimitation> findOrderByQuery(String query) throws TechnicalException {
        try {
            this.reconciliate();
            byte[] response = contract.evaluateTransaction(GET_ORDER_BY_QUERY, query);
            return response != null ? Arrays.asList(objectMapper.readValue(new String(response), OrdreLimitation[].class)) : emptyList();
        } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des ordres de limitation", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }

    public List<OrdreLimitation> findLimitationOrders(String query) throws TechnicalException {
        try {
            this.reconciliate();
            byte[] response = contract.evaluateTransaction(GET_BY_QUERY, query);
            return response != null ? Arrays.asList(objectMapper.readValue(new String(response), OrdreLimitation[].class)) : emptyList();
        } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des sites", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }

    public void updateOrdreDebutEligibilityStatus(OrdreLimitationEligibilityStatus ordreLimitationEligibilityStatus) throws BusinessException, TechnicalException {
        log.info("Modification de eligibility Status limitation : {}", ordreLimitationEligibilityStatus);
        try {
            contract.submitTransaction(UPDATE_ACTIVATION_DOCUMENT_ELIGIBILITY_STATUS, objectMapper.writeValueAsString(ordreLimitationEligibilityStatus));
        } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la modification de eligibility Status ", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
    public void reconciliate() throws ContractException, TimeoutException, InterruptedException {
        byte[] evaluateTransaction = contract.evaluateTransaction(GET_ACTIVATION_DOCUMENT_RECONCILIATION_STATE);
        if (evaluateTransaction != null && evaluateTransaction.length > 2) {
            contract.submitTransaction(UPDATE_ACTIVATION_DOCUMENT_BY_ORDERS, new String(evaluateTransaction));
        }
    }
}