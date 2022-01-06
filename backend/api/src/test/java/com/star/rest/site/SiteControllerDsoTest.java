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

import static com.star.rest.enums.InstanceEnum.DSO;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteControllerDsoTest extends AbstractIntTest {

    private static final String URL_DSO = SiteController.PATH + "/"+ DSO.getValue();

    @Value("classpath:/siteDso/site-dso-without-extension")
    private Resource siteDsoWithoutExtension;

    @Value("classpath:/siteDso/site-dso-ko.csv")
    private Resource siteDsoKo;

    @Value("classpath:/siteDso/site-dso-ok.csv")
    private Resource siteDsoOk;


    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> DSO.getValue());
    }

    @Test
    public void importSiteDsoFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-dso-without-extension",
                "text/plain", toByteArray(siteDsoWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    public void importSiteDsoFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-dso-ko.csv",
                "text/plain", toByteArray(siteDsoKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_DSO)
                .file(file))
                .andExpect(status().isConflict());
    }

//    TODO
//    @Test
//    public void importSiteDsoTest() throws Exception {
//        // GIVEN
//        MockMultipartFile file = new MockMultipartFile("file", "site-dso-ok.csv",
//                "text/plain", toByteArray(siteDsoOk.getURL()));
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