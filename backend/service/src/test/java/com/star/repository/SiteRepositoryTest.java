package com.star.repository;

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
    void testSaveSite() throws InterruptedException, TimeoutException, ContractException, TechnicalException {
        // GIVEN
        Site site = Site.builder().systemOperatorMarketParticipantMrid("PRM645KJHBD").technologyType("PHOTOVOLTAIQUE")
                .siteType("SITE_TYPE").meteringPointMrid("PRM976265R46").siteName("SITE_TEST").producerMarketParticipantMrid("AZLKJLKJBK0")
                .substationMrid("SUB_120OIHOIH").substationName("SUB_NAME_123").build();

        // WHEN
        siteRepository.saveSites(Arrays.asList(site));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(SiteRepository.CREATE_SITE);
    }

}
