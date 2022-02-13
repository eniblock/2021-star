package com.star.rest;

import com.star.rest.AbstractIntTest;
import com.star.rest.MarketParticipantController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantControllerTest extends AbstractIntTest {

    private static final String URL = MarketParticipantController.PATH;

    @Value("classpath:/marketParticipant/market-participant-without-extension")
    private Resource marketParticipantWithoutExtension;

    @Value("classpath:/marketParticipant/market-participant-ko.csv")
    private Resource marketParticipantKo;

    @Value("classpath:/marketParticipant/market-participant-ok.csv")
    private Resource marketParticipantOk;



    @Test
    public void importMarketParticipantFileExtensionKo() throws Exception {
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
    public void importMarketParticipantFileKoTest() throws Exception {
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
    public void importMarketParticipantTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "market-participant-ok.csv",
                "text/plain", toByteArray(marketParticipantOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }

}