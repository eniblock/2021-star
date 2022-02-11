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

import static com.star.rest.enums.InstanceEnum.DSO;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantControllerDsoTest extends AbstractIntTest {

    private static final String URL_DSO = MarketParticipantController.PATH + "/"+ DSO.getValue();

    @Value("classpath:/marketParticipantDso/market-participant-dso-without-extension")
    private Resource marketParticipantDsoWithoutExtension;

    @Value("classpath:/marketParticipantDso/market-participant-dso-ko.csv")
    private Resource marketParticipantDsoKo;

    @Value("classpath:/marketParticipantDso/market-participant-dso-ok.csv")
    private Resource marketParticipantDsoOk;


    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> DSO.getValue());
    }

//    @Test
//    public void importMarketParticipantDsoFileExtensionKo() throws Exception {
//        // GIVEN
//        MockMultipartFile file = new MockMultipartFile("file", "market-participant-dso-without-extension",
//                "text/plain", toByteArray(marketParticipantDsoWithoutExtension.getURL()));
//
//        // WHEN
//
//        // THEN
//        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
//                .file(file))
//                .andExpect(status().isConflict());
//    }
//
//    @Test
//    public void importMarketParticipantDsoFileKoTest() throws Exception {
//        // GIVEN
//        MockMultipartFile file = new MockMultipartFile("file", "market-participant-dso-ko.csv",
//                "text/plain", toByteArray(marketParticipantDsoKo.getURL()));
//
//        // WHEN
//
//        // THEN
//        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
//                .file(file))
//                .andExpect(status().isConflict());
//    }
//
//    @Test
//    public void importMarketParticipantDsoTest() throws Exception {
//        // GIVEN
//        MockMultipartFile file = new MockMultipartFile("file", "market-participant-dso-ok.csv",
//                "text/plain", toByteArray(marketParticipantDsoOk.getURL()));
//
//        // WHEN
//
//        // THEN
//        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
//                .file(file))
//                .andExpect(status().isCreated());
//    }

}