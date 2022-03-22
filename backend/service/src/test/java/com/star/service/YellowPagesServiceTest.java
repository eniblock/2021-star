package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.yellowpages.ImportYellowPagesResult;
import com.star.models.yellowpages.YellowPages;
import com.star.repository.YellowPagesRepository;
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
class YellowPagesServiceTest extends AbstractTest {

    @Value("classpath:/yellowPages/yellowpages-ok.csv")
    private Reader yellowPagesOk;

    @Value("classpath:/yellowPages/yellowpages-sans-header.csv")
    private Reader yellowPagesWithoutHeader;

    @Value("classpath:/yellowPages/yellowpages-header-invalide.csv")
    private Reader yellowPagesWrongHeader;

    @Value("classpath:/yellowPages/yellowpages-sans-donnees.csv")
    private Reader yellowPagesWithoutData;

    @Value("classpath:/yellowPages/yellowpages-donnees-ko.csv")
    private Reader yellowPagesDataKo;

    @Captor
    private ArgumentCaptor<List<YellowPages>> yellowPagesArgumentCaptor;

    @MockBean
    private YellowPagesRepository yellowPagesRepository;

    @Autowired
    private YellowPagesService yellowPagesService;

    @Test
    void testImportYellowPagesFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> yellowPagesService.importYellowPages(null, null));

        // THEN
    }

    @Test
    void testImportYellowPagesFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> yellowPagesService.importYellowPages(null, yellowPagesOk));

        // THEN
    }

    @Test
    void testImportYellowPagesReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> yellowPagesService.importYellowPages("file-name.csv", null));

        // THEN
    }

    @Test
    void testImportYellowPagesSansHeader() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "yellowpages-sans-header.csv";

        // WHEN
        ImportYellowPagesResult importYellowPagesResult = yellowPagesService.importYellowPages(fileName, yellowPagesWithoutHeader);

        // THEN
        assertThat(importYellowPagesResult.getErrors()).hasSize(1);
        String error = importYellowPagesResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName).contains("Structure attendue : " + new YellowPages().getHeaders());
        assertThat(importYellowPagesResult.getDatas()).isEmpty();
    }

    @Test
    void testImportYellowPagesHeaderInvalide() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "yellowpages-header-invalide.csv";

        // WHEN
        ImportYellowPagesResult importYellowPagesResult = yellowPagesService.importYellowPages(fileName, yellowPagesWrongHeader);

        // THEN
        assertThat(importYellowPagesResult.getErrors()).hasSize(1);
        String error = importYellowPagesResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName).contains("Structure attendue : " + new YellowPages().getHeaders());
        assertThat(importYellowPagesResult.getDatas()).isEmpty();
        verifyNoInteractions(yellowPagesRepository);
    }

    @Test
    void testImportYellowPagesSansDonnes() {
        // GIVEN
        String fileName = "yellowpages-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> yellowPagesService.importYellowPages(fileName, yellowPagesWithoutData));

        // THEN
    }

    @Test
    void testImportYellowPagesAvecDonneesKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "yellowpages-donnees-ko.csv";

        // WHEN
        yellowPagesService.importYellowPages(fileName, yellowPagesDataKo);

        // THEN
        verifyNoInteractions(yellowPagesRepository);
    }

    @Test
    void testImportYellowPagesOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "yellowpages-ok.csv";

        // WHEN
        yellowPagesService.importYellowPages(fileName, yellowPagesOk);

        // THEN
        Mockito.verify(yellowPagesRepository, Mockito.times(1)).saveYellowPages(yellowPagesArgumentCaptor.capture());
        YellowPages yellowPages = yellowPagesArgumentCaptor.getValue().get(0);
        assertThat(yellowPages).extracting(
                "originAutomationRegisteredResourceMrid", "registeredResourceMrid", "systemOperatorMarketParticipantMrid")
                .containsExactly("OA12DKJN7", "1651AJN", "A21");
    }
}
