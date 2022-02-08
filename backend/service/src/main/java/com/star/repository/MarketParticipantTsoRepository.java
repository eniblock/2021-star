package com.star.repository;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.TechnicalException;
import com.star.models.participant.SystemOperator;
import com.star.models.participant.tso.MarketParticipantTso;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;

import static java.util.stream.Collectors.toList;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class MarketParticipantTsoRepository {

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les markets participants TSO dans la blockchain
     *
     * @param marketParticipantTsos liste des markets participants TSO à enregistrer dans la blockchain
     * @param userId
     * @return
     * @throws TechnicalException
     */
    public List<MarketParticipantTso> save(List<MarketParticipantTso> marketParticipantTsos, String userId) throws TechnicalException {
        if(CollectionUtils.isEmpty(marketParticipantTsos)) {
            return Collections.emptyList();
        }
        log.info("Utilisateur {}. Sauvegarde des markets participants tso : {}", userId, marketParticipantTsos);
        for (MarketParticipantTso marketParticipantTso : marketParticipantTsos) {
            if (marketParticipantTso != null) {
                try {
                    contract.submitTransaction("CreateSystemOperator", marketParticipantTso.getTsoMarketParticipantMrid(), marketParticipantTso.getTsoMarketParticipantName(), marketParticipantTso.getTsoMarketParticipantRoleType());
                } catch (ContractException | TimeoutException | InterruptedException exception) {
                    throw new TechnicalException("Erreur lors de création du market participant TSO", exception);
                }
            }
        }
        return marketParticipantTsos;
    }

    /**
     * Permet de stocker les markets participants TSO dans la blockchain
     *
     * @param marketParticipantTsos liste des markets participants TSO à enregistrer dans la blockchain
     * @param userId
     * @return
     * @throws TechnicalException
     */
    public List<MarketParticipantTso> saveMarketParticipantTso(List<MarketParticipantTso> marketParticipantTsos, String userId) throws TechnicalException {
        if (CollectionUtils.isEmpty(marketParticipantTsos)) {
            return Collections.emptyList();
        }
        log.info("Utilisateur {}. Sauvegarde des markets participants tso : {}", userId, marketParticipantTsos);
        for (MarketParticipantTso marketParticipantTso : marketParticipantTsos) {
            if (marketParticipantTso != null) {
                try {
                    SystemOperator systemOperator = new SystemOperator();
                    systemOperator.setSystemOperatorMarketParticipantMrId(marketParticipantTso.getTsoMarketParticipantMrid());
                    systemOperator.setMarketParticipantName(marketParticipantTso.getTsoMarketParticipantName());
                    systemOperator.setMarketParticipantRoleType(marketParticipantTso.getTsoMarketParticipantRoleType());
                    contract.submitTransaction("CreateSystemOperator", objectMapper.writeValueAsString(systemOperator));
                } catch (ContractException | TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur lors de création du market participant TSO", exception);
                }
            }
        }
        return marketParticipantTsos;
    }


    /**
     * Permet de consulter la liste des markets participants TSO
     *
     * @return la liste des markets participants TSO
     * @throws TechnicalException
     */
    public List<MarketParticipantTso> getMarketParticipantTsos() throws TechnicalException {
        List<Selector> selectors = new ArrayList<>();
        selectors.add(Expression.eq("docType", "systemOperator"));
//        selectors.add(Expression.eq("marketParticipantType", TSO.getValue()));
        QueryBuilder queryBuilder = new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
        return findMarketParticipantTsoByQuery(queryBuilder.build());
    }

    public List<MarketParticipantTso> findMarketParticipantTsoByQuery(String query) throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction("GetAllSystemOperator");
            List<SystemOperator> systemOperators = Collections.emptyList();
            if (response != null) {
                systemOperators = Arrays.asList(objectMapper.readValue(new String(response), SystemOperator[].class));
            }
            return systemOperators.stream().map(systemOperator -> {
                MarketParticipantTso marketParticipantTso = new MarketParticipantTso();
                marketParticipantTso.setTsoMarketParticipantMrid(systemOperator.getSystemOperatorMarketParticipantMrId());
                marketParticipantTso.setTsoMarketParticipantName(systemOperator.getMarketParticipantName());
                marketParticipantTso.setTsoMarketParticipantRoleType(systemOperator.getMarketParticipantRoleType());
                return marketParticipantTso;
            }).collect(toList());
        } catch (ContractException | IOException exception) {
            throw new TechnicalException("Erreur lors de la récupération des market participant TSO", exception);
        }
    }


//    /**
//     * Permet de consulter la liste des markets participants TSO
//     *
//     * @return la liste des markets participants TSO
//     * @throws TechnicalException
//     */
//    public List<MarketParticipantTso> getMarketParticipantTsos() throws TechnicalException {
//        try {
//            byte[] response = contract.evaluateTransaction("GetAllSystemOperator");
//            return response != null ? Arrays.asList(objectMapper.readValue(response, MarketParticipantTso[].class)) : Collections.emptyList();
//        } catch (ContractException | IOException exception) {
//            throw new TechnicalException("Erreur lors de la récupération des market participant TSO", exception);
//        }
//    }
}
