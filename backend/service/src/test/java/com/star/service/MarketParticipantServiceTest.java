package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.ImportMarketParticipantResult;
import com.star.models.participant.SystemOperator;
import com.star.repository.MarketParticipantRepository;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;

import java.io.IOException;
import java.io.Reader;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;


/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class MarketParticipantServiceTest extends AbstractTest {

    @Value("classpath:/marketParticipant/market-participant-ok.csv")
    private Reader csvMarketParticipantOk;

    @Value("classpath:/marketParticipant/market-participant-sans-header.csv")
    private Reader csvMarketParticipantWithoutHeader;

    @Value("classpath:/marketParticipant/market-participant-header-invalide.csv")
    private Reader csvMarketParticipantWrongHeader;

    @Value("classpath:/marketParticipant/market-participant-sans-donnees.csv")
    private Reader csvMarketParticipantWithoutData;

    @Value("classpath:/marketParticipant/market-participant-donnees-ko.csv")
    private Reader csvMarketParticipantDataKo;

    @Captor
    private ArgumentCaptor<List<SystemOperator>> systemOperatorArgumentCaptor;

    @MockBean
    private MarketParticipantRepository marketParticipantRepository;

    @Autowired
    private MarketParticipantService marketParticipantService;

    @Test
    public void testImportMarketParticipantFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipant(null, null));

        // THEN
    }

    @Test
    public void testImportMarketParticipantFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipant(null, csvMarketParticipantOk));

        // THEN
    }

    @Test
    public void testImportMarketParticipantReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipant("file-name.csv", null));

        // THEN
    }

    @Test
    public void testImportMarketParticipantSansHeader() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "market-participant-sans-header.csv";

        // WHEN
        ImportMarketParticipantResult importMarketParticipantResult = marketParticipantService.importMarketParticipant(fileName, csvMarketParticipantWithoutHeader);

        // THEN
        assertThat(importMarketParticipantResult.getErrors()).hasSize(1);
        String error = importMarketParticipantResult.getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new SystemOperator().getHeaders());
        assertThat(importMarketParticipantResult.getDatas()).isEmpty();
    }

    @Test
    public void testImportMarketParticipantHeaderInvalide() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-header-invalide.csv";

        // WHEN
        ImportMarketParticipantResult importMarketParticipantResult = marketParticipantService.importMarketParticipant(fileName, csvMarketParticipantWrongHeader);

        // THEN
        assertThat(importMarketParticipantResult.getErrors()).hasSize(1);
        String error = importMarketParticipantResult.getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new SystemOperator().getHeaders());
        verifyNoInteractions(marketParticipantRepository);
        assertThat(importMarketParticipantResult.getDatas()).isEmpty();
    }

    @Test
    public void testImportMarketParticipantSansDonnes() {
        // GIVEN
        String fileName = "market-participant-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipant(fileName, csvMarketParticipantWithoutData));

        // THEN
    }

    @Test
    public void testImportMarketParticipantAvecDonneesKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-donnees-ko.csv";

        // WHEN
        marketParticipantService.importMarketParticipant(fileName, csvMarketParticipantDataKo);

        // THEN
        verifyNoInteractions(marketParticipantRepository);
    }

    @Test
    public void testImportMarketParticipantDsoOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-ok.csv";

        // WHEN
        marketParticipantService.importMarketParticipant(fileName, csvMarketParticipantOk);

        // THEN
        Mockito.verify(marketParticipantRepository, Mockito.times(1)).saveMarketParticipant(systemOperatorArgumentCaptor.capture());
        SystemOperator systemOperator = systemOperatorArgumentCaptor.getValue().get(0);
        assertThat(systemOperator).extracting("systemOperatorMarketParticipantMrid", "systemOperatorMarketParticipantName", "systemOperatorMarketParticipantRoleType")
                .containsExactly("17V0000009927464","RTE","A50");

    }

}
