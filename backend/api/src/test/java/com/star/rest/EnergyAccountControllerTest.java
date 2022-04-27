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
class EnergyAccountControllerTest extends AbstractIntTest {

    private static final String URL = EnergyAccountController.PATH;

    @Value("classpath:/energyAccount/energyAccount-without-extension")
    private Resource energyAccountWithoutExtension;

    @Value("classpath:/energyAccount/energyAccount-ko.json")
    private Resource energyAccountKo;

    @Value("classpath:/energyAccount/energyAccount-ok.json")
    private Resource energyAccountOk;


    @Test
    void importEnergyAccountFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("files", "energyAccount-without-extension",
                "text/plain", toByteArray(energyAccountWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importEnergyAccountKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("files", "energyAccount-ko.json",
                "text/plain", toByteArray(energyAccountKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importEnergyAccountTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("files", "energyAccount-ok.json",
                "text/plain", toByteArray(energyAccountOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }

}