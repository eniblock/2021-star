package com.star.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.models.balancing.BalancingDocument;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class BalancingDocumentControllerTest extends AbstractIntTest {

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser("spring")
    void findBalancingDocument() throws Exception {
        // GIVEN
        var balancingDocument = BalancingDocument.builder().activationDocumentMrid("123123").meteringPointMrid("PRM-325165dfs65").build();
        byte[] result = objectMapper.writeValueAsBytes(Arrays.asList(balancingDocument));
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(result);

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(BalancingDocumentController.PATH+ "?meteringPointMrid=PRM-325165dfs65"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].activationDocumentMrid").value(balancingDocument.getActivationDocumentMrid()))
                .andExpect(jsonPath("$[0].meteringPointMrid").value(balancingDocument.getMeteringPointMrid()));
    }

}
