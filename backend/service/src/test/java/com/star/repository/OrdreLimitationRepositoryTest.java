package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationEligibilityStatus;
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
class OrdreLimitationRepositoryTest extends AbstractTest {
    @Autowired
    private OrdreLimitationRepository ordreLimitationRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> reconciliationArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testSaveOrdreLimitationEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        ordreLimitationRepository.saveOrdreLimitations(Collections.emptyList());

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveOrdreLimitations() throws TechnicalException, InterruptedException, TimeoutException, ContractException {
        // GIVEN
        OrdreLimitation ordreLimitation = OrdreLimitation.builder().activationDocumentMrid("activation_id")
                .originAutomationRegisteredResourceMrid("origin_mrid").registeredResourceMrid("register_id")
                .orderValue("orderValue").measurementUnitName("mt_unit").messageType("message_type").orderEnd(false).build();

        // WHEN
        ordreLimitationRepository.saveOrdreLimitations(Arrays.asList(ordreLimitation));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(ordreLimitationRepository.CREATE_LIST);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
    }

//    @Test
//    void testFindOrderByQuery() throws ContractException, TechnicalException {
//        // GIVEN
//        String query = "query";
//        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);
//        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(null);
//
//        // WHEN
//        ordreLimitationRepository.findOrderByQuery(query);
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(2)).evaluateTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
//        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(ordreLimitationRepository.GET_ORDER_BY_QUERY);
//    }


//    @Test
//    void testFindLimitationOrders() throws ContractException, TechnicalException {
//        // GIVEN
//        String query = "query";
//        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);
//        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(null);
//
//        // WHEN
//        ordreLimitationRepository.findLimitationOrders(query);
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(2)).evaluateTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
//        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(ordreLimitationRepository.GET_BY_QUERY);
//    }


//    @Test
//    void testUpdateOrdreDebutEligibilityStatus() throws ContractException, TechnicalException, TimeoutException, InterruptedException, JsonProcessingException {
//        // GIVEN
//        String query = "query";
//        OrdreLimitationEligibilityStatus ordreLimitationEligibilityStatus = OrdreLimitationEligibilityStatus.builder().build();
//        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);
//        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(null);
//
//        // WHEN
//        ordreLimitationRepository.updateOrdreDebutEligibilityStatus(ordreLimitationEligibilityStatus);
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
//        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(ordreLimitationRepository.UPDATE_ACTIVATION_DOCUMENT_ELIGIBILITY_STATUS);
//        assertThat(objectArgumentCaptor.getValue()).isEqualTo(objectMapper.writeValueAsString(ordreLimitationEligibilityStatus));
//
//        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(reconciliationArgumentCaptor.capture());
//        assertThat(reconciliationArgumentCaptor.getValue()).isEqualTo(ordreLimitationRepository.GET_ACTIVATION_DOCUMENT_RECONCILIATION_STATE);
//    }

}
