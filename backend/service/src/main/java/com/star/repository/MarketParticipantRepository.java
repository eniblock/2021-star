package com.star.repository;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;
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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

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
    public List<MarketParticipantDso> saveMarketParticipantDso(List<MarketParticipantDso> marketParticipantDsos) throws TechnicalException {
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
     * Permet de consulter la liste des markets participants DSO
     *
     * @return la liste des markets participants DSO
     * @throws TechnicalException
     */
    public List<MarketParticipantDso> getMarketParticipantDsos() throws TechnicalException {
        List<Selector> selectors = new ArrayList<>();
        selectors.add(Expression.eq("docType", "systemOperator"));
        QueryBuilder queryBuilder = new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
        return findByQuery(queryBuilder.build());
    }

    public List<MarketParticipantDso> findByQuery(String query) throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ALL_SYSTEM_OPERATOR, query);
            List<SystemOperator> systemOperators = Collections.emptyList();
            if (response != null) {
                systemOperators = Arrays.asList(objectMapper.readValue(new String(response), SystemOperator[].class));
            }
            return systemOperators.stream().map(systemOperator -> {
                MarketParticipantDso marketParticipantDso = new MarketParticipantDso();
                marketParticipantDso.setDsoMarketParticipantMrid(systemOperator.getSystemOperatorMarketParticipantMrid());
                marketParticipantDso.setDsoMarketParticipantName(systemOperator.getSystemOperatorMarketParticipantName());
                marketParticipantDso.setDsoMarketParticipantRoleType(systemOperator.getSystemOperatorMarketParticipantRoleType());
                return marketParticipantDso;
            }).collect(Collectors.toList());
        } catch (IOException exception) {
            throw new TechnicalException("Erreur technique lors de la récupération des market participant DSO", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }


    /**
     * Permet de stocker les markets participants TSO dans la blockchain
     *
     * @param marketParticipantTsos liste des markets participants TSO à enregistrer dans la blockchain
     * @return
     * @throws TechnicalException
     */
    public List<MarketParticipantTso> saveMarketParticipantTso(List<MarketParticipantTso> marketParticipantTsos) throws TechnicalException {
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

    /**
     * Permet de consulter la liste des markets participants TSO
     *
     * @return la liste des markets participants TSO
     * @throws TechnicalException
     */
    public List<MarketParticipantTso> getMarketParticipantTsos() throws TechnicalException {
        List<Selector> selectors = new ArrayList<>();
        selectors.add(Expression.eq("docType", "systemOperator"));
        QueryBuilder queryBuilder = new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
        return findMarketParticipantTsoByQuery(queryBuilder.build());
    }

    public List<MarketParticipantTso> findMarketParticipantTsoByQuery(String query) throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ALL_SYSTEM_OPERATOR);
            List<SystemOperator> systemOperators = Collections.emptyList();
            if (response != null) {
                systemOperators = Arrays.asList(objectMapper.readValue(new String(response), SystemOperator[].class));
            }
            return systemOperators.stream().map(systemOperator -> {
                MarketParticipantTso marketParticipantTso = new MarketParticipantTso();
                marketParticipantTso.setTsoMarketParticipantMrid(systemOperator.getSystemOperatorMarketParticipantMrid());
                marketParticipantTso.setTsoMarketParticipantName(systemOperator.getSystemOperatorMarketParticipantName());
                marketParticipantTso.setTsoMarketParticipantRoleType(systemOperator.getSystemOperatorMarketParticipantRoleType());
                return marketParticipantTso;
            }).collect(toList());
        } catch (IOException exception) {
            throw new TechnicalException("Erreur technique lors de la récupération des market participant TSO", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
