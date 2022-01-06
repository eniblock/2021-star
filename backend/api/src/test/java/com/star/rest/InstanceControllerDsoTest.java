package com.star.rest;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static com.star.rest.enums.InstanceEnum.DSO;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class InstanceControllerDsoTest extends AbstractIntTest {

    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> DSO.getValue());
    }

    @Test
    public void instanceDsoTest() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        mockMvc.perform(MockMvcRequestBuilders.get(InstanceController.PATH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(Matchers.containsString(DSO.toString())));
    }
}
