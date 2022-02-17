package com.star.rest;

import com.star.rest.AbstractIntTest;
import com.star.rest.ProducerController;
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
class ProducerControllerTest extends AbstractIntTest {

    private static final String URL = ProducerController.PATH;

    @Value("classpath:/producer/producer-without-extension")
    private Resource producerWithoutExtension;

    @Value("classpath:/producer/producer-ko.csv")
    private Resource producerKo;

    @Value("classpath:/producer/producer-ok.csv")
    private Resource producerOk;


    @Test
    void importProducerFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "producer-without-extension",
                "text/plain", toByteArray(producerWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importProducerFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "producer-ko.csv",
                "text/plain", toByteArray(producerKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importProducerTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "producer-ok.csv",
                "text/plain", toByteArray(producerOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }

}