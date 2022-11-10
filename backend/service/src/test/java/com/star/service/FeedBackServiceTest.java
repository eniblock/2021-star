package com.star.service;

import com.star.AbstractTest;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.feedback.FeedBack;
import com.star.repository.FeedBackRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class FeedBackServiceTest extends AbstractTest {


    @Captor
    private ArgumentCaptor<FeedBack> feedBackArgumentCaptor;

    @MockBean
    private FeedBackRepository feedBackRepository;

    @Autowired
    private FeedBackService feedBackService;

    @Test
    void testCreateFeedBackNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> feedBackService.create(null));

        // THEN
    }

    @Test
    void testCreateFeedBackWithoutMandatoriesDatas() {
        // GIVEN
        FeedBack feedBack = FeedBack.builder().activationDocumentMrid("AJB12-340K-AHVTE-2345").feedback("feedback")
                .messageType("B30").processsType("A42").revisionNumber("1").build();

        // WHEN
        Assertions.assertThrows(BusinessException.class, () -> feedBackService.create(feedBack));

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testImportSiteOk() throws TechnicalException {
        // GIVEN
        FeedBack feedBack = FeedBack.builder().activationDocumentMrid("AJB12-340K-AHVTE-2345").feedback("feedback")
                .messageType("B30").processsType("A42").senderMarketParticipantMrid("senderMrid")
                .receiverMarketParticipantMrid("receiverMrid").validityPeriodStartDateTime("startDate")
                .validityPeriodEndDateTime("endDate").build();

        // WHEN
        feedBackService.create(feedBack);

        // THEN
        verify(feedBackRepository, Mockito.times(1)).saveFeedBack(feedBackArgumentCaptor.capture());
        assertThat(feedBackArgumentCaptor.getValue()).isNotNull();
        assertThat(feedBackArgumentCaptor.getValue()).extracting(
                "activationDocumentMrid", "feedback", "messageType", "processsType", "senderMarketParticipantMrid",
                "receiverMarketParticipantMrid", "validityPeriodStartDateTime", "validityPeriodEndDateTime")
                .containsExactly(feedBack.getActivationDocumentMrid(), feedBack.getFeedback(), feedBack.getMessageType(), feedBack.getProcesssType(),
                        feedBack.getSenderMarketParticipantMrid(), feedBack.getReceiverMarketParticipantMrid(), feedBack.getValidityPeriodStartDateTime(),
                        feedBack.getValidityPeriodEndDateTime());

    }

}
