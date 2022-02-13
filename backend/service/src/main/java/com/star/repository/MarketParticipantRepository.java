package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.participant.SystemOperator;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class MarketParticipantRepository {
    public static final String CREATE_SYSTEM_OPERATOR = "CreateSystemOperator";
    public static final String GET_ALL_SYSTEM_OPERATOR = "GetAllSystemOperator";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les markets participants dans la blockchain
     *
     * @param systemOperators liste des markets participants TSO à enregistrer dans la blockchain
     * @return
     * @throws TechnicalException
     */
    public List<SystemOperator> saveMarketParticipant(List<SystemOperator> systemOperators) throws TechnicalException, BusinessException {
        if (CollectionUtils.isEmpty(systemOperators)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des markets participants : {}", systemOperators);
        for (SystemOperator systemOperator : systemOperators) {
            if (systemOperator != null) {
                try {
                    contract.submitTransaction(CREATE_SYSTEM_OPERATOR, objectMapper.writeValueAsString(systemOperator));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création du market participant", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return systemOperators;
    }

    public List<SystemOperator> getSystemOperators() throws TechnicalException, BusinessException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ALL_SYSTEM_OPERATOR);
            return Arrays.asList(objectMapper.readValue(new String(response), SystemOperator[].class));
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de création du market participant", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
