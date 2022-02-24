package com.star.repository;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.SystemOperator;
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
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class MarketParticipantRepositoryTest extends AbstractTest {

    private static final String DSO_MARKET_PARTICIPANT_MRID = "ENEDIS02EIC";
    private static final String DSO_MARKET_PARTICIPANT_NAME = "ENEDIS";
    private static final String DSO_MARKET_PARTICIPANT_ROLE_TYPE = "A50";


    @Autowired
    private MarketParticipantRepository marketParticipantRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveMarketParticipantEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        marketParticipantRepository.saveMarketParticipant(Collections.emptyList());

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveMarketParticipants() throws TechnicalException, InterruptedException, TimeoutException, ContractException {
        // GIVEN
        SystemOperator systemOperator = new SystemOperator();
        systemOperator.setSystemOperatorMarketParticipantMrid(DSO_MARKET_PARTICIPANT_MRID);
        systemOperator.setSystemOperatorMarketParticipantName(DSO_MARKET_PARTICIPANT_NAME);
        systemOperator.setSystemOperatorMarketParticipantRoleType(DSO_MARKET_PARTICIPANT_ROLE_TYPE);

        // WHEN
        marketParticipantRepository.saveMarketParticipant(Arrays.asList(systemOperator));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(MarketParticipantRepository.CREATE_SYSTEM_OPERATOR);
    }

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
}
