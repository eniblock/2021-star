package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;

import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class HistoriqueLimitationRepository {

    public static final String GET_ACTIVATION_DOCUMENT_HISTORY = "GetActivationDocumentHistory";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    public HistoriqueLimitation[] findHistoriqueByQuery(HistoriqueLimitationCriteria criteria) throws BusinessException, TechnicalException {
        HistoriqueLimitation[] returnedArray = {};
        try {
            String jsonCriteria = objectMapper.writeValueAsString(criteria);

            log.debug("Query envoyé vers la blockchain pour rechercher les historiques de limitation: " + jsonCriteria);

            byte[] response = contract.evaluateTransaction(GET_ACTIVATION_DOCUMENT_HISTORY, jsonCriteria);

            log.debug("Valeur retournée par  la blockchain suite à une recherche d'historique de limitation: " + new String(response));

            returnedArray = response != null ? objectMapper.readValue(new String(response), new TypeReference<HistoriqueLimitation[]>() {
            }) : returnedArray;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des historiques de limitation", exception);
        } catch (ContractException contractException) {
            log.error("Erreur retournée par la blockachain : ", contractException);
            throw new BusinessException(contractException.getMessage());
        }
        return returnedArray;
    }

    // public HistoriqueLimitation[] findHistoriqueByQuery(String query) throws BusinessException, TechnicalException {
    //     try {
    //         log.debug("Query envoyé vers la blockchain pour rechercher les historiques de limitation: " + query);

    //         byte[] response = contract.evaluateTransaction(GET_ACTIVATION_DOCUMENT_HISTORY, query);
    //         return response != null ? objectMapper.readValue(new String(response), new TypeReference<HistoriqueLimitation[]>() {
    //         }) : null;
    //     } catch (JsonProcessingException exception) {
    //         throw new TechnicalException("Erreur technique lors de la recherche des historiques de limitation", exception);
    //     } catch (ContractException contractException) {
    //         log.error("Erreur retournée par la blockachain : ", contractException);
    //         throw new BusinessException(contractException.getMessage());
    //     }
    // }
}
