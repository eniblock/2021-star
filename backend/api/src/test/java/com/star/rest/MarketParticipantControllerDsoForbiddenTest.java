package com.star.rest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.apache.commons.io.IOUtils.toByteArray;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantControllerDsoForbiddenTest extends AbstractIntTest {

    private static final String URL_DSO = MarketParticipantController.PATH + "/dso";

    @Value("classpath:/marketParticipantDso/market-participant-dso-ok.csv")
    private Resource marketParticipantDsoOk;

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> "tso");
    }

    @Test
    public void importMarketParticipantDsoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-dso-ok.csv",
                "text/plain", toByteArray(marketParticipantDsoOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
                .file(file))
                .andExpect(MockMvcResultMatchers.status().isForbidden());
    }
}
