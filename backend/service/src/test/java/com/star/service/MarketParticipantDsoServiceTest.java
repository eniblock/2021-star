package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.dso.ImportMarketParticipantDsoResult;
import com.star.models.participant.dso.MarketParticipantDso;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.io.Reader;
import java.util.concurrent.TimeoutException;

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

    @Autowired
    private MarketParticipantService marketParticipantService;

    @Test
    public void testImportMarketParticipantFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso(null, null));

        // THEN
    }

    @Test
    public void testImportMarketParticipantFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso(null, csvMarketParticipantOk));

        // THEN
    }

    @Test
    public void testImportMarketParticipantReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso("file-name.csv", null));

        // THEN
    }

    @Test
    public void testImportMarketParticipantSansHeader() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-dso-sans-header.csv";

        // WHEN
        ImportMarketParticipantDsoResult importMarketParticipantDsoResult = marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantWithoutHeader);

        // THEN
        assertThat(importMarketParticipantDsoResult.getErrors()).hasSize(1);
        String error = importMarketParticipantDsoResult.getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new MarketParticipantDso().getHeaders());
    }

    @Test
    public void testImportMarketParticipantHeaderInvalide() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-dso-header-invalide.csv";

        // WHEN
        ImportMarketParticipantDsoResult importMarketParticipantDsoResult = marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantWrongHeader);

        // THEN
        assertThat(importMarketParticipantDsoResult.getErrors()).hasSize(1);
        String error = importMarketParticipantDsoResult.getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new MarketParticipantDso().getHeaders());
        verifyNoInteractions(dsoContract);
    }

    @Test
    public void testImportMarketParticipantSansDonnes() {
        // GIVEN
        String fileName = "market-participant-dso-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantWithoutData));

        // THEN
    }

    @Test
    public void testImportMarketParticipantAvecDonneesKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-dso-donnees-ko.csv";

        // WHEN
        marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantDataKo);

        // THEN
        verifyNoInteractions(dsoContract);
    }

    @Test
    public void testImportMarketParticipantOk() throws IOException, TechnicalException, InterruptedException, TimeoutException, ContractException {
        // GIVEN
        String fileName = "market-participant-dso-donnees-ok.csv";

        // WHEN
        marketParticipantService.importMarketParticipantDso(fileName, csvMarketParticipantOk);

        // THEN
        Mockito.verify(dsoContract, Mockito.times(1)).submitTransaction("CreateMarketParticipantDSO", "ENEDIS02EIC", "ENEDIS", "A50");
    }

}
