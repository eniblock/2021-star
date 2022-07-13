package com.star.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.models.limitation.OrdreLimitation;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;

import static org.apache.commons.io.IOUtils.toByteArray;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class OrdreLimitationControllerTest extends AbstractIntTest {

    private static final String URL = OrdreLimitationController.PATH + "/debut";

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-sans-extension")
    private Resource ordreLimitationWithoutExtension;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-ko.json")
    private Resource ordreLimitationKo;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-ok.json")
    private Resource ordreLimitationOk;

    @Autowired
    private ObjectMapper objectMapper;


    @Test
    @WithMockUser("spring")
    void importOrdreLimitationFileNull() {
        // GIVEN

        // WHEN

        // THEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(null)));
    }

    @Test
    @WithMockUser("spring")
    void importOrdreLimitationFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("files", "ordre-debut-limitation-sans-extension",
                "text/plain", toByteArray(ordreLimitationWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser("spring")
    void importOrdreLimitationFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("files", "ordre-debut-limitation-ko.json",
                "text/plain", toByteArray(ordreLimitationKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser("spring")
    void importOrdreLimitationTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("files", "ordre-debut-limitation-ok.json",
                "text/plain", toByteArray(ordreLimitationOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser("spring")
    void findLimitationOrder() throws Exception {
        // GIVEN
        var limitationOrder = OrdreLimitation.builder().activationDocumentMrid("123123").build();
        byte[] result = objectMapper.writeValueAsBytes(Arrays.asList(limitationOrder));
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(result);

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(OrdreLimitationController.PATH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].activationDocumentMrid").value(limitationOrder.getActivationDocumentMrid()));
    }

}
