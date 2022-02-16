package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.site.dso.SiteDso;
import com.star.models.site.tso.ImportSiteTsoResult;
import com.star.models.site.tso.SiteTso;
import com.star.repository.SiteRepository;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteTsoServiceTest extends AbstractTest {

    @Value("classpath:/siteTso/site-tso-ok.csv")
    private Reader csvSiteTsoOk;

    @Value("classpath:/siteTso/site-tso-sans-header.csv")
    private Reader csvSiteTsoWithoutHeader;

    @Value("classpath:/siteTso/site-tso-header-invalide.csv")
    private Reader csvSiteTsoWrongHeader;

    @Value("classpath:/siteTso/site-tso-sans-donnees.csv")
    private Reader csvSiteTsoWithoutData;

    @Value("classpath:/siteTso/site-tso-donnees-ko.csv")
    private Reader csvSiteTsoDataKo;

    @Captor
    private ArgumentCaptor<List<SiteTso>> siteTsoArgumentCaptor;

    @MockBean
    private SiteRepository siteRepository;

    @Autowired
    private SiteService siteService;

    @Test
    public void testImportSiteTsoFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteTso(null, null));

        // THEN
    }

    @Test
    public void testImportSiteTsoFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteTso(null, csvSiteTsoOk));

        // THEN
    }

    @Test
    public void testImportSiteTsoReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteTso("file-name.csv", null));

        // THEN
    }

    @Test
    public void testImportSiteTsoSansHeader() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-tso-sans-header.csv";

        // WHEN
        ImportSiteTsoResult importSiteTsoResult = siteService.importSiteTso(fileName, csvSiteTsoWithoutHeader);

        // THEN
        assertThat(importSiteTsoResult.getErrors()).hasSize(1);
        String error = importSiteTsoResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName);
        assertThat(error).contains(new SiteDso().getHeaders());
        assertThat(importSiteTsoResult.getDatas()).isEmpty();
    }

    @Test
    public void testSiteTsoHeaderInvalide() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-tso-header-invalide.csv";

        // WHEN
        ImportSiteTsoResult importSiteTsoResult = siteService.importSiteTso(fileName, csvSiteTsoWrongHeader);

        // THEN
        assertThat(importSiteTsoResult.getErrors()).hasSize(1);
        String error = importSiteTsoResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName);
        assertThat(error).contains("Structure attendue : " + new SiteTso().getHeaders());
        verifyNoInteractions(contract);
        assertThat(importSiteTsoResult.getDatas()).isEmpty();
    }

    @Test
    public void testImportSiteTsoSansDonnes() {
        // GIVEN
        String fileName = "site-tso-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteTso(fileName, csvSiteTsoWithoutData));

        // THEN
    }

    @Test
    public void testImportSiteTsoAvecDonneesKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-tso-donnees-ko.csv";

        // WHEN
        siteService.importSiteTso(fileName, csvSiteTsoDataKo);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    public void testImportSiteTsoOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-tso-donnees-ok.csv";
        Mockito.when(siteRepository.existSite(anyString())).thenReturn(false);

        // WHEN
        siteService.importSiteTso(fileName, csvSiteTsoOk);

        // THEN
        Mockito.verify(siteRepository, Mockito.times(1)).saveSiteTso(siteTsoArgumentCaptor.capture());
    }

}
