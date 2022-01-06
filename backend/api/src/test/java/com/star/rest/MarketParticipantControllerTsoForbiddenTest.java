package com.star.rest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantControllerTsoForbiddenTest extends AbstractIntTest {

    private static final String URL_TSO = MarketParticipantController.PATH + "/tso";

    @Value("classpath:/marketParticipantTso/market-participant-tso-ok.csv")
    private Resource marketParticipantTsoOk;

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> "dso");
    }

    @Test
    public void importMarketParticipantTsoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-tso-ok.csv",
                "text/plain", toByteArray(marketParticipantTsoOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_TSO)
                .file(file))
                .andExpect(status().isForbidden());
    }

}
