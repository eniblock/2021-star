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

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser("spring")
    void findLimitationOrder() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL_SEARCH + "?order=producerMarketParticipantMrid&orderDirection=asc"))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    @WithMockUser("spring")
    void findLimitationHistory() throws Exception {
        // GIVEN
        var historiqueLimitation = HistoriqueLimitation.builder().technologyType(TechnologyTypeEnum.EOLIEN.name()).build();
        var historiqueLimitationResponse = Arrays.asList(historiqueLimitation);
        byte[] result = objectMapper.writeValueAsBytes(historiqueLimitationResponse);
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(result);

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL_SEARCH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].technologyType").value(historiqueLimitation.getTechnologyType()));
    }
}
