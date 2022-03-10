package com.star.rest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static com.star.enums.InstanceEnum.PRODUCER;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class MarketParticipantControllerForbiddentTest extends AbstractIntTest {

    private static final String URL = MarketParticipantController.PATH;

    @Value("classpath:/marketParticipant/market-participant-ok.csv")
    private Resource marketParticipantOk;

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> PRODUCER.getValue());
    }


    @Test
    void importMarketParticipantOnProducerInstanceTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-ok.csv",
                "text/plain", toByteArray(marketParticipantOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isForbidden());
    }

}