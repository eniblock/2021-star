package com.star.rest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static com.star.enums.InstanceEnum.DSO;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class OrdreLimitationControllerForbiddenTest extends AbstractIntTest {

    private static final String URL = OrdreLimitationController.PATH+"/debut";
    @Value("classpath:/ordreLimitation/ordre-debut-limitation-ok.json")
    private Resource ordreLimitationOk;

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> DSO.getValue());
    }

    @Test
    @WithMockUser("spring")
    void importOrdreLimitationTestWithForbiddenInstance() throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", "ordre-debut-limitation-ok.json",
                "text/plain", toByteArray(ordreLimitationOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isForbidden());
    }
}