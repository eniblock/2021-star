package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.feedback.FeedBack;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class FeedBackRepositoryTest extends AbstractTest {

    @Autowired
    private FeedBackRepository feedBackRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveNullFeedBack() throws TechnicalException {
        // GIVEN

        // WHEN
        feedBackRepository.saveFeedBack(null);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveFeedBack() throws InterruptedException, TimeoutException, ContractException, TechnicalException, JsonProcessingException {
        // GIVEN
        FeedBack feedBack = FeedBack.builder().activationDocumentMrid("AJB12-340K-AHVTE-2345").feedback("feedback")
                .messageType("B30").processsType("A42").revisionNumber("1").build();
        // WHEN
        feedBackRepository.saveFeedBack(feedBack);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(),
                objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(FeedBackRepository.CREATE_FEEDBACK);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
        assertThat(objectArgumentCaptor.getValue()).isEqualTo(objectMapper.writeValueAsString(feedBack));
    }

}
