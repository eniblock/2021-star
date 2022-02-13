package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.site.ImportSiteResult;
import com.star.models.site.Site;
import com.star.repository.SiteRepository;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.io.IOException;
import java.io.Reader;
import java.util.List;

import static com.star.enums.InstanceEnum.TSO;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteServiceTest extends AbstractTest {

    @Value("classpath:/site/site-ok.csv")
    private Reader csvSiteOk;

    @Value("classpath:/site/site-technology-type-ko.csv")
    private Reader csvSiteTechnologieTypeKo;

    @Value("classpath:/site/site-sans-header.csv")
    private Reader csvSiteWithoutHeader;

    @Value("classpath:/site/site-header-invalide.csv")
    private Reader csvSiteWrongHeader;

    @Value("classpath:/site/site-sans-donnees.csv")
    private Reader csvSiteWithoutData;

    @Value("classpath:/site/site-donnees-ko.csv")
    private Reader csvSiteDataKo;

    @Captor
    private ArgumentCaptor<List<Site>> siteArgumentCaptor;

    @MockBean
    private SiteRepository siteRepository;

    @Autowired
    private SiteService siteService;

    @Test
    public void testImportSiteFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite(null, null, TSO));

        // THEN
    }

    @Test
    public void testImportSiteFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite(null, csvSiteOk, TSO));

        // THEN
    }

    @Test
    public void testImportSiteReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite("file-name.csv", null, TSO));

        // THEN
    }

    @Test
    public void testImportSiteSansHeader() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-sans-header.csv";

        // WHEN
        ImportSiteResult importSiteResult = siteService.importSite(fileName, csvSiteWithoutHeader, TSO);

        // THEN
        assertThat(importSiteResult.getErrors()).hasSize(1);
        String error = importSiteResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName);
        assertThat(error).contains("Structure attendue : " + new Site().getHeaders());
        assertThat(importSiteResult.getDatas()).isEmpty();
    }

    @Test
    public void testSiteHeaderInvalide() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-header-invalide.csv";

        // WHEN
        ImportSiteResult importSiteResult = siteService.importSite(fileName, csvSiteWrongHeader, TSO);

        // THEN
        assertThat(importSiteResult.getErrors()).hasSize(1);
        String error = importSiteResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName);
        assertThat(error).contains("Structure attendue : " + new Site().getHeaders());
        verifyNoInteractions(contract);
        assertThat(importSiteResult.getDatas()).isEmpty();
    }

    @Test
    public void testImportSiteSansDonnes() {
        // GIVEN
        String fileName = "site-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite(fileName, csvSiteWithoutData, TSO));

        // THEN
    }

    @Test
    public void testImportSiteAvecDonneesKO() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-donnees-ko.csv";

        // WHEN
        siteService.importSite(fileName, csvSiteDataKo, TSO);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    public void testImportSiteAvecTechnologyTypeKO() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-technology-type-ko.csv";

        // WHEN
        siteService.importSite(fileName, csvSiteTechnologieTypeKo, TSO);

        // THEN
        verifyNoInteractions(contract);
    }

//      TODO
//    @Test
//    public void testImportSiteOk() throws IOException, TechnicalException, ContractException {
//        // GIVEN
//        String fileName = "site-donnees-ok.csv";
//        Mockito.when(siteRepository.existSite(anyString())).thenReturn(false);
//
//        // WHEN
//        siteService.importSite(fileName, csvSiteDsoOk);
//
//        // THEN
//        Mockito.verify(siteRepository, Mockito.times(1)).saveSiteDso(siteDsoArgumentCaptor.capture());
//    }

}
