package com.star.rest;

import com.star.models.producer.Producer;
import com.star.repository.ProducerRepository;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;

import static com.star.enums.InstanceEnum.TSO;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@WithMockUser("spring")
class ProducerControllerTest extends AbstractIntTest {

    private static final String URL = ProducerController.PATH;
    @DynamicPropertySource
    private static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("instance", () -> TSO.getValue());
    }

    @Value("classpath:/producer/producer-without-extension")
    private Resource producerWithoutExtension;

    @Value("classpath:/producer/producer-ko.csv")
    private Resource producerKo;

    @Value("classpath:/producer/producer-ok.csv")
    private Resource producerOk;

    @MockBean
    private ProducerRepository producerRepository;

    @Test

    void importProducerFileExtensionKo() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "producer-without-extension",
                "text/plain", toByteArray(producerWithoutExtension.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importProducerFileKoTest() throws Exception {
        // GIVEN
        MockMultipartFile file = new MockMultipartFile("file", "producer-ko.csv",
                "text/plain", toByteArray(producerKo.getURL()));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isConflict());
    }

    @Test
    void importProducerTest() throws Exception {
        // GIVEN
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").producerMarketParticipantName("Prod1")
                .producerMarketParticipantRoleType("A21 - Producer").build();
        MockMultipartFile file = new MockMultipartFile("file", "producer-ok.csv",
                "text/plain", toByteArray(producerOk.getURL()));
        Mockito.when(producerRepository.saveProducers(any())).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.multipart(URL)
                .file(file))
                .andExpect(status().isCreated());
    }


    @Test
    void getMarketParticipantsTest() throws Exception {
        // GIVEN
        Producer producer = Producer.builder().producerMarketParticipantMrid("PR-351AKLJI").producerMarketParticipantName("PRODUCER-NAME")
                .producerMarketParticipantRoleType("ROLE").build();
        Mockito.when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));

        // WHEN

        // THEN
        this.mockMvc.perform(MockMvcRequestBuilders.get(URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].producerMarketParticipantMrid").value(producer.getProducerMarketParticipantMrid()))
                .andExpect(jsonPath("$[0].producerMarketParticipantName").value(producer.getProducerMarketParticipantName()))
                .andExpect(jsonPath("$[0].producerMarketParticipantRoleType").value(producer.getProducerMarketParticipantRoleType()));
    }
}