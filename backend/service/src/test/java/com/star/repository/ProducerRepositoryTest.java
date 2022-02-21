package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.producer.Producer;
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
class ProducerRepositoryTest extends AbstractTest {

    private static final String PRODUCER_MARKET_PARTICIPANT_MRID = "PRODUCER02EIC";
    private static final String PRODUCER_MARKET_PARTICIPANT_NAME = "PRODUCER";
    private static final String PRODUCER_MARKET_PARTICIPANT_ROLE_TYPE = "A50";

    @Autowired
    private ProducerRepository producerRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveProducersEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        producerRepository.saveProducers(Collections.emptyList());

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveProducers() throws TechnicalException, InterruptedException, TimeoutException, ContractException, JsonProcessingException {
        // GIVEN
        Producer producer = new Producer();
        producer.setProducerMarketParticipantMrid(PRODUCER_MARKET_PARTICIPANT_MRID);
        producer.setProducerMarketParticipantName(PRODUCER_MARKET_PARTICIPANT_NAME);
        producer.setProducerMarketParticipantRoleType(PRODUCER_MARKET_PARTICIPANT_ROLE_TYPE);

        // WHEN
        producerRepository.saveProducers(Arrays.asList(producer));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(ProducerRepository.CREATE_PRODUCER);
    }

    @Test
    void testGetProducers() throws ContractException, TechnicalException {
        // GIVEN
        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);

        // WHEN
        producerRepository.getProducers();

        // THEN
        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(ProducerRepository.GET_ALL_PRODUCER);
    }

}
