package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.SystemOperator;
import com.star.models.participant.dso.MarketParticipantDso;
import com.star.models.participant.tso.MarketParticipantTso;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantRepositoryTest extends AbstractTest {

    private static final String DSO_MARKET_PARTICIPANT_MRID = "ENEDIS02EIC";
    private static final String DSO_MARKET_PARTICIPANT_NAME = "ENEDIS";
    private static final String DSO_MARKET_PARTICIPANT_ROLE_TYPE = "A50";

    private static final String TSO_MARKET_PARTICIPANT_MRID = "RTE02EC";
    private static final String TSO_MARKET_PARTICIPANT_NAME = "RTE";
    private static final String TSO_MARKET_PARTICIPANT_ROLE_TYPE = "E49";

    @Autowired
    private MarketParticipantRepository marketParticipantRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    public void testSaveMarketParticipantDsoEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        marketParticipantRepository.saveMarketParticipantDso(Collections.emptyList());

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    public void testSaveMarketParticipantDso() throws TechnicalException, InterruptedException, TimeoutException, ContractException, JsonProcessingException {
        // GIVEN
        MarketParticipantDso marketParticipantDso = new MarketParticipantDso();
        marketParticipantDso.setDsoMarketParticipantMrid(DSO_MARKET_PARTICIPANT_MRID);
        marketParticipantDso.setDsoMarketParticipantName(DSO_MARKET_PARTICIPANT_NAME);
        marketParticipantDso.setDsoMarketParticipantRoleType(DSO_MARKET_PARTICIPANT_ROLE_TYPE);

        // WHEN
        marketParticipantRepository.saveMarketParticipantDso(Arrays.asList(marketParticipantDso));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
               objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(MarketParticipantRepository.CREATE_SYSTEM_OPERATOR);
    }

//    TODO
//    @Test
//    public void testGetSystemOperators() throws ContractException, JsonProcessingException {
//        // GIVEN
//        SystemOperator systemOperator = new SystemOperator();
//        Mockito.when(contract.evaluateTransaction(any())).thenReturn(systemOperator.toString().getBytes());
//
//        // WHEN
//        marketParticipantRepository.getSystemOperators();
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture());
//        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(MarketParticipantRepository.GET_ALL_SYSTEM_OPERATOR);
//    }


    @Test
    public void testSaveMarketParticipantTsoEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        marketParticipantRepository.saveMarketParticipantTso(Collections.emptyList());

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    public void testSaveMarketParticipantTso() throws TechnicalException, InterruptedException, TimeoutException, ContractException, JsonProcessingException {
        // GIVEN
        MarketParticipantTso marketParticipantTso = new MarketParticipantTso();
        marketParticipantTso.setTsoMarketParticipantMrid(TSO_MARKET_PARTICIPANT_MRID);
        marketParticipantTso.setTsoMarketParticipantName(TSO_MARKET_PARTICIPANT_NAME);
        marketParticipantTso.setTsoMarketParticipantRoleType(TSO_MARKET_PARTICIPANT_ROLE_TYPE);

        // WHEN
        marketParticipantRepository.saveMarketParticipantTso(Arrays.asList(marketParticipantTso));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(MarketParticipantRepository.CREATE_SYSTEM_OPERATOR);
    }
}
