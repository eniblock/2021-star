package com.star.rest;

import com.star.models.participant.SystemOperator;
import com.star.repository.MarketParticipantRepository;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import java.util.Arrays;

import static org.apache.commons.io.IOUtils.toByteArray;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class MarketParticipantControllerTest extends AbstractIntTest {

    private static final String URL = MarketParticipantController.PATH;

    @Value("classpath:/marketParticipant/market-participant-without-extension")
    private Resource marketParticipantWithoutExtension;

    @Value("classpath:/marketParticipant/market-participant-ko.csv")
    private Resource marketParticipantKo;

    @Value("classpath:/marketParticipant/market-participant-ok.csv")
    private Resource marketParticipantOk;

    @MockBean
    private MarketParticipantRepository marketParticipantRepository;

    @Test
    void importMarketParticipantFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-dso-without-extension",
                "text/plain", toByteArray(marketParticipantWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importMarketParticipantFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-ko.csv",
                "text/plain", toByteArray(marketParticipantKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importMarketParticipantTest() throws Exception {
        // GIVEN
        SystemOperator systemOperator = new SystemOperator();
        systemOperator.setSystemOperatorMarketParticipantMrid("17V0000009927464");
        systemOperator.setSystemOperatorMarketParticipantName("RTE");
        systemOperator.setSystemOperatorMarketParticipantRoleType("A50");
        when(marketParticipantRepository.saveMarketParticipant(any())).thenReturn(Arrays.asList(systemOperator));
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-ok.csv",
                "text/plain", toByteArray(marketParticipantOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }


    @Test
    void findMarketParticipantTest() throws Exception {
        // GIVEN
        SystemOperator systemOperator = new SystemOperator();
        systemOperator.setSystemOperatorMarketParticipantMrid("17V0000009927464");
        systemOperator.setSystemOperatorMarketParticipantName("RTE");
        systemOperator.setSystemOperatorMarketParticipantRoleType("A50");
        when(marketParticipantRepository.getSystemOperators()).thenReturn(Arrays.asList(systemOperator));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].systemOperatorMarketParticipantMrid").value(systemOperator.getSystemOperatorMarketParticipantMrid()))
                .andExpect(jsonPath("$[0].systemOperatorMarketParticipantName").value(systemOperator.getSystemOperatorMarketParticipantName()))
                .andExpect(jsonPath("$[0].systemOperatorMarketParticipantRoleType").value(systemOperator.getSystemOperatorMarketParticipantRoleType()));
    }

}