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
class SiteControllerTest extends AbstractIntTest {

    private static final String URL = SiteController.PATH;

    @Value("classpath:/site/site-without-extension")
    private Resource siteWithoutExtension;

    @Value("classpath:/site/site-ko.csv")
    private Resource siteKo;

    @Value("classpath:/site/site-ok.csv")
    private Resource siteOk;

    @MockBean
    private ProducerRepository producerRepository;

    @Autowired
    private ObjectMapper objectMapper;


    @Test
    void importSiteFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-without-extension",
                "text/plain", toByteArray(siteWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importSiteFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-ko.csv",
                "text/plain", toByteArray(siteKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importSiteTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-ok.csv",
                "text/plain", toByteArray(siteOk.getURL()));
        when(contract.evaluateTransaction(any())).thenReturn("false".getBytes());
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "PRM30001510803649")).thenReturn("false".getBytes());
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }

    @Test
    void findSiteWithoutOrderTest() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void findSiteTest() throws Exception {
        // GIVEN
        Site site = Site.builder().technologyType(TechnologyTypeEnum.EOLIEN.name()).build();
        SiteResponse siteResponse = SiteResponse.builder().bookmark("bookmark").fetchedRecordsCount(1).records(Arrays.asList(site)).build();
        byte[] result = objectMapper.writeValueAsBytes(siteResponse);
        Mockito.when(contract.evaluateTransaction(any(), any(), any(), any())).thenReturn(result);

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL + "?order=technologyType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookmark").value(siteResponse.getBookmark()))
                .andExpect(jsonPath("$.totalElements").value(siteResponse.getFetchedRecordsCount()))
                .andExpect(jsonPath("$.content[0].technologyType").value(site.getTechnologyType()));
    }

}