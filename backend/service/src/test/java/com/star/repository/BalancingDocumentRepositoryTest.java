package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.balancing.BalancingDocumentCriteria;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class BalancingDocumentRepositoryTest extends AbstractTest {

    @Autowired
    private BalancingDocumentRepository balancingDocumentRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testFindBalancingDocument() throws TechnicalException, ContractException, JsonProcessingException {
        // GIVEN
        BalancingDocumentCriteria balancingDocumentCriteria = BalancingDocumentCriteria.builder()
                .meteringPointMrid("PRM-14563SM896").activationDocumentMrid("MR-12KJI").build();

        // WHEN
        balancingDocumentRepository.findBalancingDocumentByCriteria(balancingDocumentCriteria);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(balancingDocumentRepository.SEARCH_BALANCING_DOCUMENT_BY_CRITERIA);
        assertThat(objectArgumentCaptor.getValue()).isEqualTo(objectMapper.writeValueAsString(balancingDocumentCriteria));
    }
}