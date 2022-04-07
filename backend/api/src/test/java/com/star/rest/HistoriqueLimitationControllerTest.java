package com.star.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.TechnologyTypeEnum;
import com.star.models.producer.Producer;
import com.star.models.site.Site;
import com.star.models.site.SiteResponse;
import com.star.repository.ProducerRepository;
import com.star.repository.SiteRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;

import static org.apache.commons.io.IOUtils.toByteArray;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class HistoriqueLimitationControllerTest extends AbstractIntTest {

    private static final String URL_SEARCH = HistoriqueLimitationController.PATH;

    @Test
    void findLimitationOrder() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL_SEARCH + "?order=producerMarketParticipantMrid&orderDirection=asc"))
                .andExpect(status().is2xxSuccessful());
    }

}
