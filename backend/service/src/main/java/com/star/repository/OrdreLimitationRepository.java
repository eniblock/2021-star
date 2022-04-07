package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.limitation.OrdreLimitation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class OrdreLimitationRepository {
    public static final String CREATE = "CreateActivationDocument";
    public static final String GET_ORDER_BY_QUERY = "GetActivationDocumentByQuery";
    public static final String GET_BY_QUERY = "GetActivationDocumentByQuery";

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
            return Collections.emptyList();
        }
        log.info("Sauvegarde des ordres de limitation : {}", ordreLimitations);
        for (OrdreLimitation ordreLimitation : ordreLimitations) {
            if (ordreLimitation != null) {
                try {
                    contract.submitTransaction(CREATE, objectMapper.writeValueAsString(ordreLimitation));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création de l'ordre de limitation ", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return ordreLimitations;
    }

    public List<OrdreLimitation> findOrderByQuery(String query) throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ORDER_BY_QUERY, query);
            return response != null ? objectMapper.readValue(new String(response), List.class) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des ordres de limitation", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }

    public List<OrdreLimitation> findLimitationOrders(String query) throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_BY_QUERY, query);
            return response != null ? objectMapper.readValue(new String(response), List.class) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des sites", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
