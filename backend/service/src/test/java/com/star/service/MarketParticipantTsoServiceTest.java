package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.participant.tso.ImportMarketParticipantTsoResult;
import com.star.models.participant.tso.MarketParticipantTso;
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
public class MarketParticipantTsoServiceTest extends AbstractTest {

    @Value("classpath:/marketParticipantTso/market-participant-tso-ok.csv")
    private Reader csvMarketParticipantTsoOk;

    @Value("classpath:/marketParticipantTso/market-participant-tso-sans-header.csv")
    private Reader csvMarketParticipantTsoWithoutHeader;

    @Value("classpath:/marketParticipantTso/market-participant-tso-header-invalide.csv")
    private Reader csvMarketParticipantTsoWrongHeader;

    @Value("classpath:/marketParticipantTso/market-participant-tso-sans-donnees.csv")
    private Reader csvMarketParticipantTsoWithoutData;

    @Value("classpath:/marketParticipantTso/market-participant-tso-donnees-ko.csv")
    private Reader csvMarketParticipantTsoDataKo;

    @Autowired
    private MarketParticipantService marketParticipantService;

    @Test
    public void testImportMarketParticipantTsoFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantTso(null, null));

        // THEN
    }

    @Test
    public void testImportMarketParticipantTsoFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantTso(null, csvMarketParticipantTsoOk));

        // THEN
    }

    @Test
    public void testImportMarketParticipantTsoReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantTso("file-name.csv", null));

        // THEN
    }

    @Test
    public void testImportMarketParticipantTsoSansHeader() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-tso-sans-header.csv";

        // WHEN
        ImportMarketParticipantTsoResult importMarketParticipantTsoResult = marketParticipantService.importMarketParticipantTso(fileName, csvMarketParticipantTsoWithoutHeader);

        // THEN
        assertThat(importMarketParticipantTsoResult .getErrors()).hasSize(1);
        String error = importMarketParticipantTsoResult .getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new MarketParticipantTso().getHeaders());
    }

    @Test
    public void testImportMarketParticipantTsoHeaderInvalide() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-tso-header-invalide.csv";

        // WHEN
        ImportMarketParticipantTsoResult importMarketParticipantTsoResult = marketParticipantService.importMarketParticipantTso(fileName, csvMarketParticipantTsoWrongHeader);

        // THEN
        assertThat(importMarketParticipantTsoResult .getErrors()).hasSize(1);
        String error = importMarketParticipantTsoResult .getErrors().get(0);
        assertThat(error).contains("Fichier "+fileName);
        assertThat(error).contains("Structure attendue : "+ new MarketParticipantTso().getHeaders());
        verifyNoInteractions(contract);
    }

    @Test
    public void testImportMarketParticipantTsoSansDonnes() {
        // GIVEN
        String fileName = "market-participant-tso-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> marketParticipantService.importMarketParticipantTso(fileName, csvMarketParticipantTsoWithoutData));

        // THEN
    }

    @Test
    public void testImportMarketParticipantTsoAvecDonneesKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "market-participant-tso-donnees-ko.csv";

        // WHEN
        marketParticipantService.importMarketParticipantTso(fileName, csvMarketParticipantTsoDataKo);

        // THEN
        verifyNoInteractions(contract);
    }

//    @Test
//    public void testImportMarketParticipantTsoOk() throws IOException, TechnicalException, InterruptedException, TimeoutException, ContractException {
//        // GIVEN
//        String fileName = "market-participant-tso-ok.csv";
//
//        // WHEN
//        marketParticipantService.importMarketParticipantTso(fileName, csvMarketParticipantTsoOk);
//
//        // THEN
//        Mockito.verify(contract, Mockito.times(1)).submitTransaction("CreateMarketParticipantTSO","RTE01EIC", "RTE", "A49");
//    }

}
