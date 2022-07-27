package com.star.rest;

import org.junit.Ignore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
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
@Ignore
class SiteControllerForbiddenTest extends AbstractIntTest {

    private static final String URL_CREATE = SiteController.PATH + "/create";
    private static final String URL_UPDATE = SiteController.PATH + "/update";

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> PRODUCER.getValue());
    }

    @Value("classpath:/site/site-tso-ok.csv")
    private Resource siteTsoOk;

//    @Test
//    @WithMockUser("spring")
//    void importSiteOnProducerInstanceTest() throws Exception {
//        // GIVEN
//        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ok.csv",
//                "text/plain", toByteArray(siteTsoOk.getURL()));
//        // WHEN
//
//        // THEN
//        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_CREATE)
//                .file(file))
//                .andExpect(status().isForbidden());
//    }
//
//    @Test
//    @WithMockUser("spring")
//    void updateSiteOnProducerInstanceTest() throws Exception {
//        // GIVEN
//        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ok.csv",
//                "text/plain", toByteArray(siteTsoOk.getURL()));
//        // WHEN
//
//        // THEN
//        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_UPDATE)
//                .file(file))
//                .andExpect(status().isForbidden());
//    }

}