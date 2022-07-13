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

import java.util.concurrent.TimeoutException;

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

    @Autowired
    private OrdreLimitationRepository ordreLimitationRepository;

    public HistoriqueLimitation[] findHistoriqueByQuery(HistoriqueLimitationCriteria criteria) throws BusinessException, TechnicalException {
        HistoriqueLimitation[] returnedArray = {};
        try {
            ordreLimitationRepository.reconciliate();
            byte[] response = contract.evaluateTransaction(GET_ACTIVATION_DOCUMENT_HISTORY, objectMapper.writeValueAsString(criteria));
            returnedArray = (response != null && response.length != 0) ?
                    objectMapper.readValue(new String(response), new TypeReference<HistoriqueLimitation[]>() {
                    })
                    : returnedArray;
        } catch (JsonProcessingException | TimeoutException | InterruptedException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des historiques de limitation", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return returnedArray;
    }
}
