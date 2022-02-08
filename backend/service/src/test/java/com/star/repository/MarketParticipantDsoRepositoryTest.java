package com.star.repository;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.dso.MarketParticipantDso;
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
public class MarketParticipantDsoRepositoryTest extends AbstractTest {

    private static final String USER_ID = "USER_ID";
    private static final String DSO_MARKET_PARTICIPANT_MRID = "ENEDIS02EIC";
    private static final String DSO_MARKET_PARTICIPANT_NAME = "ENEDIS";
    private static final String DSO_MARKET_PARTICIPANT_ROLE_TYPE = "A50";

    @Autowired
    private MarketParticipantDsoRepository marketParticipantDsoRepository;

    @Test
    public void testSaveEmptyList() throws TechnicalException {
        // GIVEN
        MarketParticipantDso marketParticipantDso = new MarketParticipantDso();
        marketParticipantDso.setDsoMarketParticipantMrid(DSO_MARKET_PARTICIPANT_MRID);
        marketParticipantDso.setDsoMarketParticipantName(DSO_MARKET_PARTICIPANT_NAME);
        marketParticipantDso.setDsoMarketParticipantRoleType(DSO_MARKET_PARTICIPANT_ROLE_TYPE);

        // WHEN
        marketParticipantDsoRepository.save(Collections.emptyList(), USER_ID);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    public void testSave() throws TechnicalException, InterruptedException, TimeoutException, ContractException {
        // GIVEN
        MarketParticipantDso marketParticipantDso = new MarketParticipantDso();
        marketParticipantDso.setDsoMarketParticipantMrid(DSO_MARKET_PARTICIPANT_MRID);
        marketParticipantDso.setDsoMarketParticipantName(DSO_MARKET_PARTICIPANT_NAME);
        marketParticipantDso.setDsoMarketParticipantRoleType(DSO_MARKET_PARTICIPANT_ROLE_TYPE);

        // WHEN
        marketParticipantDsoRepository.save(Arrays.asList(marketParticipantDso), USER_ID);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction("CreateMarketParticipantDSO",
                DSO_MARKET_PARTICIPANT_MRID, DSO_MARKET_PARTICIPANT_NAME, DSO_MARKET_PARTICIPANT_ROLE_TYPE);
    }

//    @Test
//    public void testGetMarketParticipantDsos() throws ContractException, TechnicalException {
//        // GIVEN
//        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);
//
//        // WHEN
////        marketParticipantDsoRepository.getMarketParticipantDsos();
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction("GetAllMarketParticipantDSO");
//    }
}
