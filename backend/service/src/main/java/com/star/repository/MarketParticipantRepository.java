package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.participant.SystemOperator;
import com.star.models.participant.dso.MarketParticipantDso;
import com.star.models.participant.tso.MarketParticipantTso;
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
     * Permet de stocker les markets participants DSO dans la blockchain
     *
     * @param marketParticipantDsos liste des markets participants DSO à enregistrer dans la blockchain
     * @return
     * @throws TechnicalException
     */
    public List<MarketParticipantDso> saveMarketParticipantDso(List<MarketParticipantDso> marketParticipantDsos) throws TechnicalException, BusinessException {
        if (CollectionUtils.isEmpty(marketParticipantDsos)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des markets participants dso : {}", marketParticipantDsos);
        for (MarketParticipantDso marketParticipantDso : marketParticipantDsos) {
            if (marketParticipantDso != null) {
                try {
                    SystemOperator systemOperator = new SystemOperator();
                    systemOperator.setSystemOperatorMarketParticipantMrid(marketParticipantDso.getDsoMarketParticipantMrid());
                    systemOperator.setSystemOperatorMarketParticipantName(marketParticipantDso.getDsoMarketParticipantName());
                    systemOperator.setSystemOperatorMarketParticipantRoleType(marketParticipantDso.getDsoMarketParticipantRoleType());
                    contract.submitTransaction(CREATE_SYSTEM_OPERATOR, objectMapper.writeValueAsString(systemOperator));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création du market participant dso", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return marketParticipantDsos;
    }

    /**
     * Permet de stocker les markets participants TSO dans la blockchain
     *
     * @param marketParticipantTsos liste des markets participants TSO à enregistrer dans la blockchain
     * @return
     * @throws TechnicalException
     */
    public List<MarketParticipantTso> saveMarketParticipantTso(List<MarketParticipantTso> marketParticipantTsos) throws TechnicalException, BusinessException {
        if (CollectionUtils.isEmpty(marketParticipantTsos)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des markets participants tso : {}", marketParticipantTsos);
        for (MarketParticipantTso marketParticipantTso : marketParticipantTsos) {
            if (marketParticipantTso != null) {
                try {
                    SystemOperator systemOperator = new SystemOperator();
                    systemOperator.setSystemOperatorMarketParticipantMrid(marketParticipantTso.getTsoMarketParticipantMrid());
                    systemOperator.setSystemOperatorMarketParticipantName(marketParticipantTso.getTsoMarketParticipantName());
                    systemOperator.setSystemOperatorMarketParticipantRoleType(marketParticipantTso.getTsoMarketParticipantRoleType());
                    contract.submitTransaction(CREATE_SYSTEM_OPERATOR, objectMapper.writeValueAsString(systemOperator));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création du market participant TSO", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return marketParticipantTsos;
    }

    public List<SystemOperator> getSystemOperators() throws JsonProcessingException, ContractException {
        byte[] response = contract.evaluateTransaction(GET_ALL_SYSTEM_OPERATOR);
        return Arrays.asList(objectMapper.readValue(new String(response), SystemOperator[].class));
    }
}
