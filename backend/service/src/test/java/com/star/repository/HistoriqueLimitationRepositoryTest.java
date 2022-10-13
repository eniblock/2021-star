package com.star.repository;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class HistoriqueLimitationRepositoryTest extends AbstractTest {

    private static final String PRODUCER_MARKET_PARTICIPANT_MRID = "PRODUCER02EIC";
    private static final String PRODUCER_MARKET_PARTICIPANT_NAME = "PRODUCER";
    private static final String PRODUCER_MARKET_PARTICIPANT_ROLE_TYPE = "A50";

    @Autowired
    private HistoriqueLimitationRepository historiqueLimitationRepository;

    @Captor
    private ArgumentCaptor<String> reconciliationArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> historiqueLimitationArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;


//    @Test
//    void testFindHistoriqueByQuery() throws ContractException, TechnicalException {
//        // GIVEN
//        HistoriqueLimitationCriteria historiqueLimitationCriteria = HistoriqueLimitationCriteria.builder().build();
//        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);
//        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(null);
//
//        // WHEN
//        historiqueLimitationRepository.findHistoriqueByQuery(historiqueLimitationCriteria);
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(2)).evaluateTransaction(historiqueLimitationArgumentCaptor.capture(), objectArgumentCaptor.capture());
//        assertThat(historiqueLimitationArgumentCaptor.getValue()).isEqualTo(historiqueLimitationRepository.GET_ACTIVATION_DOCUMENT_HISTORY);
//    }

}
