package com.star.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.TechnologyTypeEnum;
import com.star.models.common.PageHLF;
import com.star.models.producer.Producer;
import com.star.models.site.Site;
import com.star.repository.ProducerRepository;
import com.star.repository.SiteRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
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

    private static final String URL_SEARCH = SiteController.PATH;
    private static final String URL_CREATE = SiteController.PATH+"/create";
    private static final String URL_UPDATE = SiteController.PATH+"/update";

    @Value("classpath:/site/site-without-extension")
    private Resource siteWithoutExtension;

    @Value("classpath:/site/site-ko.csv")
    private Resource siteKo;

    @Value("classpath:/site/site-tso-ko.csv")
    private Resource siteTsoKo;

    @Value("classpath:/site/site-tso-ok.csv")
    private Resource siteTsoOk;

    @MockBean
    private ProducerRepository producerRepository;

    @Autowired
    private ObjectMapper objectMapper;


    @Test
    @WithMockUser("spring")
    void importSiteFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-without-extension",
                "text/plain", toByteArray(siteWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_CREATE)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser("spring")
    void importSiteFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-ko.csv",
                "text/plain", toByteArray(siteKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_CREATE)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser("spring")
    void importSiteDsoOnTsoInstanceTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ko.csv",
                "text/plain", toByteArray(siteTsoKo.getURL()));
        when(contract.evaluateTransaction(any())).thenReturn("false".getBytes());
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "PRM30001510803649")).thenReturn("false".getBytes());
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_CREATE)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser("spring")
    void importSiteTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ok.csv",
                "text/plain", toByteArray(siteTsoOk.getURL()));
        when(contract.evaluateTransaction(any())).thenReturn("false".getBytes());
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "CART30001510803649")).thenReturn("false".getBytes());
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_CREATE)
                .file(file))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser("spring")
    void updateSiteTestKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-ok.csv",
                "text/plain", toByteArray(siteTsoKo.getURL()));
        when(contract.evaluateTransaction(any())).thenReturn("false".getBytes());
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "PRM30001510803649")).thenReturn("false".getBytes());
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_UPDATE)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser("spring")
    void updateSiteDsoOnTsoInstanceTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ko.csv",
                "text/plain", toByteArray(siteTsoKo.getURL()));
        when(contract.evaluateTransaction(any())).thenReturn("false".getBytes());
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "PRM30001510803649")).thenReturn("true".getBytes());
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_UPDATE)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser("spring")
    void updateSiteTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "site-tso-ok.csv",
                "text/plain", toByteArray(siteTsoOk.getURL()));
        when(contract.evaluateTransaction(any())).thenReturn("false".getBytes());
        when(contract.evaluateTransaction(SiteRepository.SITE_EXISTS, "CART30001510803649")).thenReturn("true".getBytes());
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL_UPDATE)
                .file(file))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("spring")
    void findSiteWithoutOrderTest() throws Exception {
        // GIVEN

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL_CREATE))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser("spring")
    void findSiteTest() throws Exception {
        // GIVEN
        Site site = Site.builder().technologyType(TechnologyTypeEnum.EOLIEN.name()).build();
        byte[] result = objectMapper.writeValueAsBytes(Arrays.asList(site));
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(result);

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL_SEARCH + "?order=technologyType"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].technologyType").value(site.getTechnologyType()));
    }

}
