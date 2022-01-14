package com.star.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.TechnicalException;
import com.star.models.participant.tso.MarketParticipantTso;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.io.IOException;
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
public class MarketParticipantTsoRepository {

    @Autowired
    private Contract tsoContract;

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
                    tsoContract.submitTransaction("CreateMarketParticipantTSO", marketParticipantTso.getTsoMarketParticipantMrid(), marketParticipantTso.getTsoMarketParticipantName(), marketParticipantTso.getTsoMarketParticipantRoleType());
                } catch (ContractException | TimeoutException | InterruptedException exception) {
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
        try {
            byte[] response = tsoContract.evaluateTransaction("GetAllMarketParticipantTSO");
            return response != null ? Arrays.asList(objectMapper.readValue(response, MarketParticipantTso[].class)) : Collections.emptyList();
        } catch (ContractException | IOException exception) {
            throw new TechnicalException("Erreur lors de la récupération des market participant TSO", exception);
        }
    }
}
