package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.producer.ImportProducerResult;
import com.star.models.producer.Producer;
import com.star.repository.ProducerRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.io.IOException;
import java.io.Reader;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class ProducerServiceTest extends AbstractTest {

    @Value("classpath:/producer/producer-ok.csv")
    private Reader producerOk;

    @Value("classpath:/producer/producer-sans-header.csv")
    private Reader producerWithoutHeader;

    @Value("classpath:/producer/producer-header-invalide.csv")
    private Reader producerWrongHeader;

    @Value("classpath:/producer/producer-sans-donnees.csv")
    private Reader producerWithoutData;

    @Value("classpath:/producer/producer-donnees-ko.csv")
    private Reader producerDataKo;

    @Captor
    private ArgumentCaptor<List<Producer>> producerArgumentCaptor;

    @MockBean
    private ProducerRepository producerRepository;

    @Autowired
    private ProducerService producerService;

    @Test
    void testImportProducerFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> producerService.importProducers(null, null));

        // THEN
    }

    @Test
    void testImportProducerFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> producerService.importProducers(null, producerOk));

        // THEN
    }

    @Test
    void testImportProducerReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> producerService.importProducers("file-name.csv", null));

        // THEN
    }

    @Test
    void testImportProducersSansHeader() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "producer-sans-header.csv";

        // WHEN
        ImportProducerResult importProducerResult = producerService.importProducers(fileName, producerWithoutHeader);

        // THEN
        assertThat(importProducerResult .getErrors()).hasSize(1);
        String error = importProducerResult .getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new Producer().getHeaders());
        assertThat(importProducerResult.getDatas()).isEmpty();
    }

    @Test
    void testImportProducerHeaderInvalide() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "producer-header-invalide.csv";

        // WHEN
        ImportProducerResult importProducerResult = producerService.importProducers(fileName, producerWrongHeader);

        // THEN
        assertThat(importProducerResult .getErrors()).hasSize(1);
        String error = importProducerResult .getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new Producer().getHeaders());
        assertThat(importProducerResult.getDatas()).isEmpty();
        verifyNoInteractions(producerRepository);
    }

    @Test
    void testImportProducerSansDonnes() {
        // GIVEN
        String fileName = "producer-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> producerService.importProducers(fileName, producerWithoutData));

        // THEN
    }

    @Test
    void testImportProducerAvecDonneesKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "producer-donnees-ko.csv";

        // WHEN
        producerService.importProducers(fileName, producerDataKo);

        // THEN
        verifyNoInteractions(producerRepository);
    }

    @Test
    void testImportProducerOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "producer-ok.csv";

        // WHEN
        producerService.importProducers(fileName, producerOk);

        // THEN
        Mockito.verify(producerRepository, Mockito.times(1)).saveProducers(producerArgumentCaptor.capture());
        Producer producer = producerArgumentCaptor.getValue().get(0);
        assertThat(producer).extracting("producerMarketParticipantMrid", "producerMarketParticipantName", "producerMarketParticipantRoleType").containsExactly("EolienFRvert28EIC","EolienFR vert Cie","A21");
    }

}
