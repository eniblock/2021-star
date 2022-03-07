package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.limitation.FichierOrdreLimitation;
import com.star.models.limitation.ImportOrdreDebutLimitationResult;
import com.star.models.limitation.OrdreDebutLimitation;
import com.star.repository.OrdreLimitationRepository;
import org.apache.commons.io.IOUtils;
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
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class OrdreLimitationServiceTest extends AbstractTest {

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-ok.json")
    private Reader ordreDebutLimitationOk;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-sans-extension")
    private Reader ordreDebutLimitationWithoutExtension;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-sans-donnees.json")
    private Reader ordreDebutLimitationWithoutData;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-donnees-ko.json")
    private Reader ordreDebutLimitationDataKo;

    @Captor
    private ArgumentCaptor<List<OrdreDebutLimitation>> ordreDebutLimitationArgumentCaptor;

    @MockBean
    private OrdreLimitationRepository ordreLimitationRepository;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Test
    void testImportOrdreDebutLimitationNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(null));

        // THEN
    }

    @Test
    void testImportOrdreDebutLimitationVide() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(new ArrayList<>()));

        // THEN
    }

    @Test
    void testImportOrdreDebutLimitationSansExtension() {
        // GIVEN
        String fileName = "ordre-debut-limitation-sans-extension";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationWithoutExtension))));

        // THEN
    }

    @Test
    void testImportOrdreDebutLimitationSansDonnees() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "ordre-debut-limitation-sans-donnees.json";

        // WHEN
        ImportOrdreDebutLimitationResult importOrdreDebutLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationWithoutData)));

        // THEN
        assertThat(importOrdreDebutLimitationResult.getErrors()).hasSize(1);
        assertThat(importOrdreDebutLimitationResult.getDatas()).isEmpty();
        verifyNoInteractions(ordreLimitationRepository);
    }


    @Test
    void testImportOrdreDebutLimitationAvecDonneesKo() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "ordre-debut-limitation-donnees-ko.json";

        // WHEN
        ImportOrdreDebutLimitationResult importOrdreDebutLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationDataKo)));

        // THEN
        assertThat(importOrdreDebutLimitationResult.getErrors()).isNotEmpty();
        assertThat(importOrdreDebutLimitationResult.getDatas()).isEmpty();
        verifyNoInteractions(ordreLimitationRepository);
    }

    @Test
    void testImportOrdreDebutLimitationOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "ordre-debut-limitation-ok.json";

        // WHEN
        ImportOrdreDebutLimitationResult importOrdreDebutLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationOk)));

        // THEN
        assertThat(importOrdreDebutLimitationResult.getErrors()).isEmpty();
        Mockito.verify(ordreLimitationRepository, Mockito.times(1)).saveOrdreDebutLimitations(ordreDebutLimitationArgumentCaptor.capture());
        assertThat(ordreDebutLimitationArgumentCaptor.getValue()).hasSize(1);
        OrdreDebutLimitation ordreDebutLimitation = ordreDebutLimitationArgumentCaptor.getValue().get(0);
        assertThat(ordreDebutLimitation).extracting("originAutomationRegisteredResourceMrid", "registeredResourceMrid",
                "measurementUnitName", "startCreatedDateTime", "messageType", "businessType", "reasonCode", "orderEnd")
                .containsExactly("ORIGIN_LNKINS_LKNZ", "PRM30001510803649", "MW", "", "message type", "business Type", "reason code", false);

    }

    private FichierOrdreLimitation createFichierOrdreLimitation(String fileName, Reader reader) throws IOException {
        FichierOrdreLimitation fichierOrdreLimitation = new FichierOrdreLimitation();
        fichierOrdreLimitation.setFileName(fileName);
        fichierOrdreLimitation.setInputStream(IOUtils.toInputStream(IOUtils.toString(reader), StandardCharsets.UTF_8));
        return fichierOrdreLimitation;
    }
}
