package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.site.Site;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class SiteRepositoryTest extends AbstractTest {

    @Autowired
    private SiteRepository siteRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> parameterArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveSiteEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        siteRepository.saveSites(Collections.emptyList());

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveSite() throws InterruptedException, TimeoutException, ContractException, TechnicalException, JsonProcessingException {
        // GIVEN
        Site site = getSite();
        // WHEN
        siteRepository.saveSites(Arrays.asList(site));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(SiteRepository.CREATE_SITE);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
        assertThat(objectArgumentCaptor.getValue()).isEqualTo(objectMapper.writeValueAsString(site));
    }


    @Test
    void testUpdateSite() throws InterruptedException, TimeoutException, ContractException, TechnicalException, JsonProcessingException {
        // GIVEN
        Site site = getSite();

        // WHEN
        siteRepository.updateSites(Arrays.asList(getSite()));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(SiteRepository.UPDATE_SITE);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
        assertThat(objectArgumentCaptor.getValue()).isEqualTo(objectMapper.writeValueAsString(site));
    }

    @Test
    void testExistSite() throws ContractException, TechnicalException {
        // GIVEN
        String meteringPointMrid = "PRM-35164JHBHJ-51";
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn("false".getBytes());

        // WHEN
        siteRepository.existSite(meteringPointMrid);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture(), parameterArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(SiteRepository.SITE_EXISTS);
        assertThat(parameterArgumentCaptor.getValue()).isEqualTo(meteringPointMrid);
    }

    @Test
    void testFindSiteByQuery() throws ContractException, TechnicalException {
        // GIVEN
        String query = "query";
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(null);

        // WHEN
        siteRepository.findSiteByQuery(query);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture(), parameterArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(SiteRepository.GET_SITE_BY_QUERY);
        assertThat(parameterArgumentCaptor.getValue()).isEqualTo(query);
    }


    private Site getSite() {
        return Site.builder().systemOperatorMarketParticipantMrid("PRM645KJHBD").technologyType("PHOTOVOLTAIQUE")
                .siteType("SITE_TYPE").meteringPointMrid("PRM976265R46").siteName("SITE_TEST").producerMarketParticipantMrid("AZLKJLKJBK0")
                .substationMrid("SUB_120OIHOIH").substationName("SUB_NAME_123").build();
    }
}
