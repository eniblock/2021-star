package com.star.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.TechnologyTypeEnum;
import com.star.models.common.PageHLF;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import com.star.models.site.Site;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
