package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.site.dso.ImportSiteDsoResult;
import com.star.models.site.dso.SiteDso;
import com.star.repository.SiteRepository;
import org.hyperledger.fabric.gateway.ContractException;
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
public class SiteDsoServiceTest extends AbstractTest {

    @Value("classpath:/siteDso/site-dso-ok.csv")
    private Reader csvSiteDsoOk;

    @Value("classpath:/siteDso/site-dso-technology-type-ko.csv")
    private Reader csvSiteDsoTechnologieTypeKo;

    @Value("classpath:/siteDso/site-dso-sans-header.csv")
    private Reader csvSiteDsoWithoutHeader;

    @Value("classpath:/siteDso/site-dso-header-invalide.csv")
    private Reader csvSiteDsoWrongHeader;

    @Value("classpath:/siteDso/site-dso-sans-donnees.csv")
    private Reader csvSiteDsoWithoutData;

    @Value("classpath:/siteDso/site-dso-donnees-ko.csv")
    private Reader csvSiteDsoDataKo;

    @Captor
    private ArgumentCaptor<List<SiteDso>> siteDsoArgumentCaptor;

    @MockBean
    private SiteRepository siteRepository;

    @Autowired
    private SiteService siteService;

    @Test
    public void testImportSiteDsoFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteDso(null, null));

        // THEN
    }

    @Test
    public void testImportSiteDsoFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteDso(null, csvSiteDsoOk));

        // THEN
    }

    @Test
    public void testImportSiteDsoReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteDso("file-name.csv", null));

        // THEN
    }

    @Test
    public void testImportSiteDsoSansHeader() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-dso-sans-header.csv";

        // WHEN
        ImportSiteDsoResult importSiteDsoResult = siteService.importSiteDso(fileName, csvSiteDsoWithoutHeader);

        // THEN
        assertThat(importSiteDsoResult.getErrors()).hasSize(1);
        String error = importSiteDsoResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName);
        assertThat(error).contains("Structure attendue : " + new SiteDso().getHeaders());
        assertThat(importSiteDsoResult.getDatas()).isEmpty();
    }

    @Test
    public void testSiteDsoHeaderInvalide() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-dso-header-invalide.csv";

        // WHEN
        ImportSiteDsoResult importSiteDsoResult = siteService.importSiteDso(fileName, csvSiteDsoWrongHeader);

        // THEN
        assertThat(importSiteDsoResult.getErrors()).hasSize(1);
        String error = importSiteDsoResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName);
        assertThat(error).contains("Structure attendue : " + new SiteDso().getHeaders());
        verifyNoInteractions(contract);
        assertThat(importSiteDsoResult.getDatas()).isEmpty();
    }

    @Test
    public void testImportSiteDsoSansDonnes() {
        // GIVEN
        String fileName = "site-dso-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSiteDso(fileName, csvSiteDsoWithoutData));

        // THEN
    }

    @Test
    public void testImportSiteDsoAvecDonneesKO() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-dso-donnees-ko.csv";

        // WHEN
        siteService.importSiteDso(fileName, csvSiteDsoDataKo);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    public void testImportSiteDsoAvecTechnologyTypeKO() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-tso-technology-type-ko.csv";

        // WHEN
        siteService.importSiteDso(fileName, csvSiteDsoTechnologieTypeKo);

        // THEN
        verifyNoInteractions(contract);
    }

//      TODO
//    @Test
//    public void testImportSiteDsoOk() throws IOException, TechnicalException, ContractException {
//        // GIVEN
//        String fileName = "site-dso-donnees-ok.csv";
//        Mockito.when(siteRepository.existSite(anyString())).thenReturn(false);
//
//        // WHEN
//        siteService.importSiteDso(fileName, csvSiteDsoOk);
//
//        // THEN
//        Mockito.verify(siteRepository, Mockito.times(1)).saveSiteDso(siteDsoArgumentCaptor.capture());
//    }

}
