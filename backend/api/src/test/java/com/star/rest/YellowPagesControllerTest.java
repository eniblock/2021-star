package com.star.rest;

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
class YellowPagesControllerTest extends AbstractIntTest {

    private static final String URL = YellowPagesController.PATH;

    @Value("classpath:/yellowPages/yellowpages-without-extension")
    private Resource yellowPagesWithoutExtension;

    @Value("classpath:/yellowPages/yellowpages-ko.csv")
    private Resource yellowPagesKo;

    @Value("classpath:/yellowPages/yellowpages-ok.csv")
    private Resource yellowPagesOk;


    @Test
    void importYellowPagesFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "yellowpages-without-extension",
                "text/plain", toByteArray(yellowPagesWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importYellowPagesFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "yellowpages-ko.csv",
                "text/plain", toByteArray(yellowPagesKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importYellowPagesTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "yellowpages-ok.csv",
                "text/plain", toByteArray(yellowPagesOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }

}