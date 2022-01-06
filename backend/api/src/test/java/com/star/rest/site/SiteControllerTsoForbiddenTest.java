package com.star.rest.site;

import com.star.rest.AbstractIntTest;
import com.star.rest.SiteController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteControllerTsoForbiddenTest extends AbstractIntTest {

    private static final String URL_TSO = SiteController.PATH + "/tso";

    @Value("classpath:/siteTso/site-tso-ok.csv")
    private Resource siteTsoOk;

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> "dso");
    }

    @Test
    public void importSiteTsoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ok.csv",
                "text/plain", toByteArray(siteTsoOk.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_TSO)
                .file(file))
                .andExpect(status().isForbidden());
    }

}
