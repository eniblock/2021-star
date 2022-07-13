package com.star.rest;

import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class HistoriqueLimitationControllerTest extends AbstractIntTest {

    private static final String URL_SEARCH = HistoriqueLimitationController.PATH;

    @Test
    @WithMockUser("spring")
    void findLimitationOrder() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL_SEARCH + "?order=producerMarketParticipantMrid&orderDirection=asc"))
                .andExpect(status().is2xxSuccessful());
    }
}
