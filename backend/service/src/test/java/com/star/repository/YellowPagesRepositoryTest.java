package com.star.repository;

import com.star.AbstractTest;
import com.star.enums.DocTypeEnum;
import com.star.exception.TechnicalException;
import com.star.models.yellowpages.YellowPages;
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
class YellowPagesRepositoryTest extends AbstractTest {

    private static final String ORIGIN_AUTOMATION_REGISTERED_RESOURCE_MRID = "ORIGIN_AUTOMATION_REGISTERED_RESOURCE_MRID";
    private static final String REGISTERED_RESOURCE_MRID = "REGISTERED_RESOURCE_MRID";
    private static final String SYSTEM_OPERATOR_MARKET_PARTICIPANT_MRID = "SYSTEM_OPERATOR_MARKET_PARTICIPANT_MRID";

    @Autowired
    private YellowPagesRepository yellowPagesRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveYellowPagesEmptyList() throws TechnicalException {
        // GIVEN

        // WHEN
        yellowPagesRepository.saveYellowPages(Collections.emptyList());

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveYellowPagesRepository() throws InterruptedException, TimeoutException, ContractException, TechnicalException {
        // GIVEN
        YellowPages yellowPages = YellowPages.builder().docType(DocTypeEnum.YELLOW_PAGES.getDocType())
                .originAutomationRegisteredResourceMrid(ORIGIN_AUTOMATION_REGISTERED_RESOURCE_MRID)
                .registeredResourceMrid(REGISTERED_RESOURCE_MRID)
                .systemOperatorMarketParticipantMrid(SYSTEM_OPERATOR_MARKET_PARTICIPANT_MRID).build();

        // WHEN
        yellowPagesRepository.saveYellowPages(Arrays.asList(yellowPages));

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(yellowPagesRepository.CREATE_YELLOW_PAGES);
    }

    @Test
    void testGetYellowPages() throws ContractException, TechnicalException {
        // GIVEN
        Mockito.when(contract.evaluateTransaction(any())).thenReturn(null);

        // WHEN
        yellowPagesRepository.getYellowPages();

        // THEN
        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(yellowPagesRepository.GET_ALL_YELLOW_PAGES);
    }

}
