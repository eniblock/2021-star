package com.star.repository;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.tso.MarketParticipantTso;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.TimeoutException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantTsoRepositoryTest extends AbstractTest {

    private static final String USER_ID = "USER_ID";
    private static final String TSO_MARKET_PARTICIPANT_MRID = "RTE02EC";
    private static final String TSO_MARKET_PARTICIPANT_NAME = "RTE";
    private static final String TSO_MARKET_PARTICIPANT_ROLE_TYPE = "E49";

    @Autowired
    private MarketParticipantTsoRepository marketParticipantTsoRepository;

    @Test
    public void testSaveEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        marketParticipantTsoRepository.save(Collections.emptyList(), USER_ID);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    public void testSave() throws TechnicalException, InterruptedException, TimeoutException, ContractException {
        // GIVEN
        MarketParticipantTso marketParticipantTso = new MarketParticipantTso();
        marketParticipantTso.setTsoMarketParticipantMrid(TSO_MARKET_PARTICIPANT_MRID);
        marketParticipantTso.setTsoMarketParticipantName(TSO_MARKET_PARTICIPANT_NAME);
        marketParticipantTso.setTsoMarketParticipantRoleType(TSO_MARKET_PARTICIPANT_ROLE_TYPE);

        // WHEN
        marketParticipantTsoRepository.save(Arrays.asList(marketParticipantTso), USER_ID);

        // THEN
//        Mockito.verify(contract, Mockito.times(1)).submitTransaction("CreateMarketParticipantTSO",
//                TSO_MARKET_PARTICIPANT_MRID, TSO_MARKET_PARTICIPANT_NAME, TSO_MARKET_PARTICIPANT_ROLE_TYPE);
    }

//    @Test
//    public void testGetMarketParticipantTsos() throws ContractException, TechnicalException {
//        // GIVEN
//        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);
//
//        // WHEN
//        marketParticipantTsoRepository.getMarketParticipantTsos();
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction("GetAllMarketParticipantTSO");
//    }
}
