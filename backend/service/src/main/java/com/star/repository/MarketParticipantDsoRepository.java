package com.star.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.TechnicalException;
import com.star.models.participant.dso.MarketParticipantDso;
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
public class MarketParticipantDsoRepository {

    @Autowired
    private Contract dsoContract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     *  Permet de stocker les markets participants DSO dans la blockchain
     * @param marketParticipantDsos liste des markets participants DSO à enregistrer dans la blockchain
     * @param userId
     * @return
     * @throws TechnicalException
     */
    public List<MarketParticipantDso> save(List<MarketParticipantDso> marketParticipantDsos, String userId) throws TechnicalException {
        if(CollectionUtils.isEmpty(marketParticipantDsos)) {
            return Collections.emptyList();
        }
        log.info("Utilisateur {}. Sauvegarde des markets participants dso : {}", userId, marketParticipantDsos);
        for (MarketParticipantDso marketParticipantDso : marketParticipantDsos) {
            if (marketParticipantDso != null) {
                try {
                    dsoContract.submitTransaction("CreateMarketParticipantDSO", marketParticipantDso.getDsoMarketParticipantMrid(), marketParticipantDso.getDsoMarketParticipantName(), marketParticipantDso.getDsoMarketParticipantRoleType());
                } catch (ContractException | TimeoutException | InterruptedException exception) {
                    throw new TechnicalException("Erreur lors de création du market participant DSO", exception);
                }
            }
        }
        return marketParticipantDsos;
    }

    /**
     * Permet de consulter la liste des markets participants DSO
     * @return la liste des markets participants DSO
     * @throws TechnicalException
     */
//    public List<MarketParticipantDso> getMarketParticipantDsos() throws TechnicalException {
//        try {
//            byte[] response = dsoContract.evaluateTransaction("GetAllMarketParticipantDSO");
//            return response != null ? Arrays.asList(objectMapper.readValue(response, MarketParticipantDso[].class)) : Collections.emptyList();
//        } catch (ContractException | IOException exception) {
//            throw new TechnicalException("Erreur lors de la récupération des market participant DSO", exception);
//        }
//    }
}
