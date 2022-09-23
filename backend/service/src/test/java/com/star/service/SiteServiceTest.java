package com.star.service;

import com.star.AbstractTest;
import com.star.enums.TechnologyTypeEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.producer.Producer;
import com.star.models.site.ImportSiteResult;
import com.star.models.site.Site;
import com.star.models.site.SiteCrteria;
import com.star.repository.ProducerRepository;
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
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.io.Reader;
import java.util.Arrays;
import java.util.List;

import static com.star.enums.InstanceEnum.DSO;
import static com.star.enums.InstanceEnum.TSO;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class SiteServiceTest extends AbstractTest {

    @Value("classpath:/site/site-tso-ok.csv")
    private Reader csvSiteTsoOk;

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

    @Captor
    private ArgumentCaptor<String> meteringPointMridCaptor;

    @Captor
    private ArgumentCaptor<String> queryCaptor;

    @MockBean
    private SiteRepository siteRepository;

    @MockBean
    private ProducerRepository producerRepository;

    @Autowired
    private SiteService siteService;

    @Test
    void testImportSiteFileNameNullEtReaderNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite(null, null, TSO));

        // THEN
    }

    @Test
    void testImportSiteFileNameNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite(null, csvSiteTsoOk, TSO));

        // THEN
    }

    @Test
    void testImportSiteReaderNul() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite("file-name.csv", null, TSO));

        // THEN
    }

    @Test
    void testImportSiteSansHeader() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-sans-header.csv";

        // WHEN
        ImportSiteResult importSiteResult = siteService.importSite(fileName, csvSiteWithoutHeader, TSO);

        // THEN
        assertThat(importSiteResult.getErrors()).hasSize(1);
        String error = importSiteResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName).contains("Structure attendue : " + new Site().getHeaders());
        assertThat(importSiteResult.getDatas()).isEmpty();
    }

    @Test
    void testSiteHeaderInvalide() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-header-invalide.csv";

        // WHEN
        ImportSiteResult importSiteResult = siteService.importSite(fileName, csvSiteWrongHeader, TSO);

        // THEN
        assertThat(importSiteResult.getErrors()).hasSize(1);
        String error = importSiteResult.getErrors().get(0);
        assertThat(error).contains("Fichier " + fileName).contains("Structure attendue : " + new Site().getHeaders());
        verifyNoInteractions(contract);
        assertThat(importSiteResult.getDatas()).isEmpty();
    }

    @Test
    void testImportSiteSansDonnes() {
        // GIVEN
        String fileName = "site-sans-donnees.csv";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> siteService.importSite(fileName, csvSiteWithoutData, TSO));

        // THEN
    }

    @Test
    void testImportSiteAvecDonneesKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-donnees-ko.csv";

        // WHEN
        siteService.importSite(fileName, csvSiteDataKo, TSO);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testImportSiteAvecTechnologyTypeKO() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-technology-type-ko.csv";

        // WHEN
        siteService.importSite(fileName, csvSiteTechnologieTypeKo, TSO);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testImportSiteOk() throws IOException, TechnicalException, ContractException {
        // GIVEN
        String fileName = "site-tso-ok.csv";
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        Mockito.when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));
        Mockito.when(contract.evaluateTransaction(any())).thenReturn("false".getBytes());

        // WHEN
        siteService.importSite(fileName, csvSiteTsoOk, TSO);

        // THEN
        verify(siteRepository, Mockito.times(1)).existSite(meteringPointMridCaptor.capture());
        verify(siteRepository, Mockito.times(1)).saveSites(siteArgumentCaptor.capture());
        assertThat(siteArgumentCaptor.getValue()).hasSize(1);
        List<Site> sites = siteArgumentCaptor.getValue();
        assertThat(sites.get(0)).extracting("systemOperatorMarketParticipantMrid", "meteringPointMrid", "producerMarketParticipantMrid", "technologyType", "systemOperatorCustomerServiceName")
                .containsExactly("17V0000009927464", "PDL30001510803649", "17Y100A101R0629X", "Eolien", "ARD Ouest");

    }

    @Test
    void testUpdateUnknownSite() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-tso-ok.csv";
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        Mockito.when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));
        Mockito.when(siteRepository.existSite(any())).thenReturn(false);

        // WHEN
        siteService.updateSite(fileName, csvSiteTsoOk, TSO);

        // THEN
        verify(siteRepository, Mockito.times(1)).existSite(meteringPointMridCaptor.capture());
        assertThat(meteringPointMridCaptor.getValue()).isEqualTo("PDL30001510803649");
        verify(siteRepository, never()).updateSites(any());
    }

    @Test
    void testUpdateExistsSite() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "site-tso-ok.csv";
        Producer producer = Producer.builder().producerMarketParticipantMrid("17Y100A101R0629X").
                producerMarketParticipantName("producer_test").producerMarketParticipantRoleType("roleType").build();
        Mockito.when(producerRepository.getProducers()).thenReturn(Arrays.asList(producer));
        Mockito.when(siteRepository.existSite(any())).thenReturn(true);

        // WHEN
        siteService.updateSite(fileName, csvSiteTsoOk, TSO);

        // THEN
        verify(siteRepository, Mockito.times(1)).existSite(meteringPointMridCaptor.capture());
        assertThat(meteringPointMridCaptor.getValue()).isEqualTo("PDL30001510803649");
        verify(siteRepository, Mockito.times(1)).updateSites(siteArgumentCaptor.capture());
        List<Site> sites = siteArgumentCaptor.getValue();
        assertThat(sites.get(0)).extracting("systemOperatorMarketParticipantMrid", "meteringPointMrid", "producerMarketParticipantMrid", "technologyType", "systemOperatorCustomerServiceName")
                .containsExactly("17V0000009927464", "PDL30001510803649", "17Y100A101R0629X", "Eolien", "ARD Ouest");
    }

    @Test
    void testFindSite() throws TechnicalException {
        // GIVEN
        SiteCrteria siteCrteria = SiteCrteria.builder().siteIecCode("IecCode").siteName("site_test").instance(TSO)
                .meteringPointMrId("PDLJGHVG17868").producerMarketParticipantMrid("PRODUCER_MR_ID")
                .producerMarketParticipantName("PRC_NAME").substationMrid("SUB_MRID").substationName("SUB_NAME")
                .technologyType(Arrays.asList(TechnologyTypeEnum.EOLIEN)).build();

        // WHEN
        siteService.findSite(siteCrteria, Sort.by("technologyType"));

        // THEN
        verify(siteRepository, Mockito.times(1)).findSiteByQuery(queryCaptor.capture());

        String queryValue = queryCaptor.getValue();
        assertThat(queryValue).contains("docType", "siteName", "substationName", "substationMrid",
                "producerMarketParticipantName", "producerMarketParticipantMrid", "siteIecCode", "meteringPointMrid", "technologyType");
    }


    // @Test
    // void testFindSiteWithoutMeteringPointMrIdOnTso() throws IOException, TechnicalException, ContractException {
    //     // GIVEN
    //     SiteCrteria siteCrteria = SiteCrteria.builder().siteIecCode("IecCode").siteName("site_test").instance(TSO)
    //             .producerMarketParticipantMrid("PRODUCER_MR_ID")
    //             .producerMarketParticipantName("PRC_NAME").substationMrid("SUB_MRID").substationName("SUB_NAME").build();

    //     // WHEN
    //     siteService.findSite(siteCrteria, Sort.by("technologyType"));

    //     // THEN
    //     verify(siteRepository, Mockito.times(1)).findSiteByQuery(queryCaptor.capture());

    //     String queryValue = queryCaptor.getValue();
    //     assertThat(queryValue).contains("meteringPointMrid", Site.CODE_SITE_HTA, Site.CODE_SITE_HTB_PDL, Site.CODE_SITE_HTB_CART);
    // }

    // @Test
    // void testFindSiteWithoutMeteringPointMrIdOnDso() throws TechnicalException {
    //     // GIVEN
    //     SiteCrteria siteCrteria = SiteCrteria.builder().siteIecCode("IecCode").siteName("site_test").instance(DSO)
    //             .producerMarketParticipantMrid("PRODUCER_MR_ID")
    //             .producerMarketParticipantName("PRC_NAME").substationMrid("SUB_MRID").substationName("SUB_NAME").build();

    //     // WHEN
    //     siteService.findSite(siteCrteria, Sort.by("producerMarketParticipantName"));

    //     // THEN
    //     verify(siteRepository, Mockito.times(1)).findSiteByQuery(queryCaptor.capture());

    //     String queryValue = queryCaptor.getValue();
    //     assertThat(queryValue).contains("meteringPointMrid", Site.CODE_SITE_HTA, Site.CODE_SITE_HTB_PDL, Site.CODE_SITE_HTB_CART);
    // }
}
