package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.dso.ImportMarketParticipantDsoResult;
import com.star.models.participant.dso.MarketParticipantDso;
import com.star.repository.MarketParticipantRepository;
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
public class MarketParticipantDsoServiceTest extends AbstractTest {

    @Value("classpath:/marketParticipantDso/market-participant-dso-ok.csv")
    private Reader csvMarketParticipantOk;

    @Value("classpath:/marketParticipantDso/market-participant-dso-sans-header.csv")
    private Reader csvMarketParticipantWithoutHeader;

    @Value("classpath:/marketParticipantDso/market-participant-dso-header-invalide.csv")
    private Reader csvMarketParticipantWrongHeader;

    @Value("classpath:/marketParticipantDso/market-participant-dso-sans-donnees.csv")
    private Reader csvMarketParticipantWithoutData;

    @Value("classpath:/marketParticipantDso/market-participant-dso-donnees-ko.csv")
    private Reader csvMarketParticipantDataKo;

    @Captor
    private ArgumentCaptor<List<MarketParticipantDso>> marketParticipantDsoArgumentCaptor;

    @MockBean
    private MarketParticipantRepository marketParticipantRepository;

    @Autowired
    private MarketParticipantService marketParticipantService;

//    @Test
//    public void testImportMarketParticipantDsoFileNameNullEtReaderNull() {
//        // GIVEN
//
//        // WHEN
//        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso(null, null));
//
//        // THEN
//    }
//
//    @Test
//    public void testImportMarketParticipantDsoFileNameNull() {
//        // GIVEN
//
//        // WHEN
//        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso(null, csvMarketParticipantOk));
//
//        // THEN
//    }
//
//    @Test
//    public void testImportMarketParticipantDsoReaderNul() {
//        // GIVEN
//
//        // WHEN
//        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso("file-name.csv", null));
//
//        // THEN
//    }
//
//    @Test
//    public void testImportMarketParticipantDsoSansHeader() throws IOException, TechnicalException {
//        // GIVEN
//        String fileName = "market-participant-dso-sans-header.csv";
//
//        // WHEN
//        ImportMarketParticipantDsoResult importMarketParticipantDsoResult = marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantWithoutHeader);
//
//        // THEN
//        assertThat(importMarketParticipantDsoResult.getErrors()).hasSize(1);
//        String error = importMarketParticipantDsoResult.getErrors().get(0);
//        assertThat(error).contains("Fichier "+fileName);
//        assertThat(error).contains("Structure attendue : "+ new MarketParticipantDso().getHeaders());
//        assertThat(importMarketParticipantDsoResult.getDatas()).isEmpty();
//    }
//
//    @Test
//    public void testImportMarketParticipantDsoHeaderInvalide() throws IOException, TechnicalException {
//        // GIVEN
//        String fileName = "market-participant-dso-header-invalide.csv";
//
//        // WHEN
//        ImportMarketParticipantDsoResult importMarketParticipantDsoResult = marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantWrongHeader);
//
//        // THEN
//        assertThat(importMarketParticipantDsoResult.getErrors()).hasSize(1);
//        String error = importMarketParticipantDsoResult.getErrors().get(0);
//        assertThat(error).contains("Fichier "+fileName);
//        assertThat(error).contains("Structure attendue : "+ new MarketParticipantDso().getHeaders());
//        verifyNoInteractions(marketParticipantRepository);
//        assertThat(importMarketParticipantDsoResult.getDatas()).isEmpty();
//    }
//
//    @Test
//    public void testImportMarketParticipantDsoSansDonnes() {
//        // GIVEN
//        String fileName = "market-participant-dso-sans-donnees.csv";
//
//        // WHEN
//        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantWithoutData));
//
//        // THEN
//    }
//
//    @Test
//    public void testImportMarketParticipantDsoAvecDonneesKO() throws IOException, TechnicalException {
//        // GIVEN
//        String fileName = "market-participant-dso-donnees-ko.csv";
//
//        // WHEN
//        marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantDataKo);
//
//        // THEN
//        verifyNoInteractions(marketParticipantRepository);
//    }
//
//    @Test
//    public void testImportMarketParticipantDsoOk() throws IOException, TechnicalException {
//        // GIVEN
//        String fileName = "market-participant-dso-donnees-ok.csv";
//
//        // WHEN
//        marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantOk);
//
//        // THEN
//        Mockito.verify(marketParticipantRepository, Mockito.times(1)).saveMarketParticipantDso(marketParticipantDsoArgumentCaptor.capture());
//        MarketParticipantDso marketParticipantDso = marketParticipantDsoArgumentCaptor.getValue().get(0);
//        assertThat(marketParticipantDso).extracting("dsoMarketParticipantMrid", "dsoMarketParticipantName", "dsoMarketParticipantRoleType").containsExactly("ENEDIS02EIC","ENEDIS","A50");
//
//    }

}
