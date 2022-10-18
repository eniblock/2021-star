package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.balancing.BalancingDocument;
import com.star.models.balancing.BalancingDocumentCriteria;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class BalancingDocumentRepository {
    public static final String SEARCH_BALANCING_DOCUMENT_BY_CRITERIA = "SearchBalancingDocumentByCriteria";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;


    public List<BalancingDocument> findBalancingDocumentByCriteria(BalancingDocumentCriteria criteria) throws BusinessException, TechnicalException {
        log.info("Appel de la blockchain pour rechercher les balancing document avec les critères : {}", criteria);
        List<BalancingDocument> balancingDocuments;
        try {
            byte[] response = contract.evaluateTransaction(SEARCH_BALANCING_DOCUMENT_BY_CRITERIA, objectMapper.writeValueAsString(criteria));
            balancingDocuments = (response != null && response.length != 0) ?
//                    objectMapper.readValue(new String(response), new TypeReference<List<BalancingDocument>>(){}) : Collections.emptyList();
                    objectMapper.readerForListOf(BalancingDocument.class).readValue(new String(response)) : Collections.emptyList();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) de la recherche des historiques de limitation ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return balancingDocuments;
    }
}
