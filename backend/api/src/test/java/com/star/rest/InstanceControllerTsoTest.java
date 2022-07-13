package com.star.rest;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static com.star.enums.InstanceEnum.TSO;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class InstanceControllerTsoTest extends AbstractIntTest {

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> TSO.getValue());
    }

    @Test
    @WithMockUser("spring")
    void instanceTsoTest() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        mockMvc.perform(MockMvcRequestBuilders.get(InstanceController.PATH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(Matchers.containsString(TSO.toString())));
    }
}
