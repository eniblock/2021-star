package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.limitation.OrdreLimitation;
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
import static org.mockito.ArgumentMatchers.eq;
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
    private ArgumentCaptor<String> objectArgumentCaptor;

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

    // @Test
    // void findLimitationOrders() throws ContractException, TechnicalException {
    //     // GIVEN
    //     Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);
    //     var anyArguments = "myArgs...";

    //     // WHEN
    //     ordreLimitationRepository.findLimitationOrders(anyArguments);

    //     // THEN
    //     Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture(), eq(anyArguments));
    //     assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(OrdreLimitationRepository.GET_BY_QUERY);
    // }

}
