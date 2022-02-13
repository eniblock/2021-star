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
public class SiteControllerTest extends AbstractIntTest {

    private static final String URL_DSO = SiteController.PATH;

    @Value("classpath:/site/site-without-extension")
    private Resource siteWithoutExtension;

    @Value("classpath:/site/site-ko.csv")
    private Resource siteKo;

    @Value("classpath:/site/site-ok.csv")
    private Resource siteOk;

    @Test
    public void importSiteFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-without-extension",
                "text/plain", toByteArray(siteWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    public void importSiteFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-ko.csv",
                "text/plain", toByteArray(siteKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
                .file(file))
                .andExpect(status().isConflict());
    }

//    TODO
//    @Test
//    public void importSiteTest() throws Exception {
//        // GIVEN
//        MockMultipartFile file = new MockMultipartFile("file", "site-dso-ok.csv",
//                "text/plain", toByteArray(siteOk.getURL()));
//        byte[] response = "false".getBytes();
//        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "PDL00000000289770")).thenReturn(response);
//
//        // WHEN
//
//        // THEN
//        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
//                .file(file))
//                .andExpect(status().isCreated());
//    }

}