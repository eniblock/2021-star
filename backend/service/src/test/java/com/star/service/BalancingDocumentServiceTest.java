package com.star.service;

import com.star.AbstractTest;
import com.star.exception.BusinessException;
import com.star.models.balancing.BalancingDocumentCriteria;
import com.star.repository.BalancingDocumentRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class BalancingDocumentServiceTest extends AbstractTest {

    @MockBean
    private BalancingDocumentRepository balancingDocumentRepository;

    @Autowired
    private BalancingDocumentService balancingDocumentService;

    @Captor
    private ArgumentCaptor<BalancingDocumentCriteria> balancingDocumentCriteriaArgumentCaptor;


    @Test
    void testFindBalancingDocumentWithNullCriteria() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> balancingDocumentService.findBalancingDocument(null));

        // THEN
        Mockito.verifyNoInteractions(balancingDocumentRepository);
    }


    @Test
    void testFindBalancingDocumentWithEmptyCriteria() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(BusinessException.class, () -> balancingDocumentService.findBalancingDocument(new BalancingDocumentCriteria()));

        // THEN
        Mockito.verifyNoInteractions(balancingDocumentRepository);
    }

    @Test
    void testFindBalancingDocument() throws Exception {
        // GIVEN
        BalancingDocumentCriteria balancingDocumentCriteria = BalancingDocumentCriteria.builder().activationDocumentMrid("MR-12KJI").build();

        // WHEN
        balancingDocumentService.findBalancingDocument(balancingDocumentCriteria);

        // THEN
        Mockito.verify(balancingDocumentRepository, Mockito.times(1)).findBalancingDocumentByCriteria(balancingDocumentCriteriaArgumentCaptor.capture());
        assertThat(balancingDocumentCriteriaArgumentCaptor.getValue().getActivationDocumentMrid()).isEqualTo(balancingDocumentCriteria.getActivationDocumentMrid());
    }
}
