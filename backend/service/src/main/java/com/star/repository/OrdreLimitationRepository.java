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

import java.util.ArrayList;
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
        log.info("Sauvegarde de {} ordres de limitation.", ordreLimitations.size());
        try {
            contract.submitTransaction(CREATE_LIST, objectMapper.writeValueAsString(ordreLimitations));
            this.reconciliate();
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception) lors de la création de l'ordre de limitation ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) lors de la création de l'ordre de limitation ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) lors de la création de l'ordre de limitation ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }

        return ordreLimitations;
    }

    public List<OrdreLimitation> findOrderByQuery(String query) throws TechnicalException {
        List<OrdreLimitation> results = new ArrayList<>();
        try {
            this.reconciliate();
            byte[] response = contract.evaluateTransaction(GET_ORDER_BY_QUERY, query);
            results = response != null ? Arrays.asList(objectMapper.readValue(new String(response), OrdreLimitation[].class)) : emptyList();
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception)  ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return results;
    }

    public List<OrdreLimitation> findLimitationOrders(String query) throws TechnicalException {
        List<OrdreLimitation> results = new ArrayList<>();
        try {
            this.reconciliate();
            byte[] response = contract.evaluateTransaction(GET_BY_QUERY, query);
            results = response != null ? Arrays.asList(objectMapper.readValue(new String(response), OrdreLimitation[].class)) : emptyList();
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception)  ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return results;
    }

    public void updateOrdreDebutEligibilityStatus(OrdreLimitationEligibilityStatus ordreLimitationEligibilityStatus) throws BusinessException, TechnicalException {
        log.info("Modification de eligibility Status limitation : {}", ordreLimitationEligibilityStatus);
        try {
            contract.submitTransaction(UPDATE_ACTIVATION_DOCUMENT_ELIGIBILITY_STATUS, objectMapper.writeValueAsString(ordreLimitationEligibilityStatus));
            this.reconciliate();
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception)  ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }

    public void reconciliate() throws ContractException, TimeoutException, InterruptedException {
        log.debug("Appel de GetActivationDocumentReconciliationState mis en commentaire temporaire");
       byte[] evaluateTransaction = contract.evaluateTransaction(GET_ACTIVATION_DOCUMENT_RECONCILIATION_STATE);
       if (evaluateTransaction != null && evaluateTransaction.length > 2) {
           contract.submitTransaction(UPDATE_ACTIVATION_DOCUMENT_BY_ORDERS, new String(evaluateTransaction));
       }
    }
}
