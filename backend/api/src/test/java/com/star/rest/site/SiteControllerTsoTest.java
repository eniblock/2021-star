package com.star.rest.site;

import com.star.repository.SiteRepository;
import com.star.rest.AbstractIntTest;
import com.star.rest.SiteController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static com.star.rest.enums.InstanceEnum.TSO;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteControllerTsoTest extends AbstractIntTest {

    private static final String URL_TSO = SiteController.PATH + "/"+TSO.getValue();

    @Value("classpath:/siteTso/site-tso-without-extension")
    private Resource siteTsoWithoutExtension;

    @Value("classpath:/siteTso/site-tso-ko.csv")
    private Resource siteTsoKo;

    @Value("classpath:/siteTso/site-tso-ok.csv")
    private Resource siteTsoOk;

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> TSO.getValue());
    }


    @Test
    public void importSiteTsoFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-without-extension",
                "text/plain", toByteArray(siteTsoWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_TSO)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    public void importSiteTsoFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ko.csv",
                "text/plain", toByteArray(siteTsoKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_TSO)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    public void importSiteTsoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ok.csv",
                "text/plain", toByteArray(siteTsoOk.getURL()));
        byte[] response = "false".getBytes();
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "PDL00000000278966")).thenReturn(response);
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "PDL0000000028869")).thenReturn(response);

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_TSO)
                .file(file))
                .andExpect(status().isCreated());
    }

}