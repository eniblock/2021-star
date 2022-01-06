package com.star.rest.marketparticipant;

import com.star.rest.AbstractIntTest;
import com.star.rest.MarketParticipantController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static com.star.rest.enums.InstanceEnum.TSO;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantControllerTsoTest extends AbstractIntTest {

    private static final String URL_TSO = MarketParticipantController.PATH + "/"+TSO.getValue();

    @Value("classpath:/marketParticipantTso/market-participant-tso-without-extension")
    private Resource marketParticipantTsoWithoutExtension;

    @Value("classpath:/marketParticipantTso/market-participant-tso-ko.csv")
    private Resource marketParticipantTsoKo;

    @Value("classpath:/marketParticipantTso/market-participant-tso-ok.csv")
    private Resource marketParticipantTsoOk;

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> TSO.getValue());
    }


    @Test
    public void importMarketParticipantTsoFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-tso-without-extension",
                "text/plain", toByteArray(marketParticipantTsoWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_TSO)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    public void importMarketParticipantTsoFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-tso-ko.csv",
                "text/plain", toByteArray(marketParticipantTsoKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_TSO)
                .file(file))
                .andExpect(status().isConflict());
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
                .andExpect(status().isCreated());
    }

}