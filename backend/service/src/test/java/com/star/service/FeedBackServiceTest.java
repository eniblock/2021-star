package com.star.service;

import com.star.AbstractTest;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.feedback.FeedBack;
import com.star.models.feedback.FeedBackPostMessage;
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
        Assertions.assertThrows(IllegalArgumentException.class, () -> feedBackService.postMessage(null));

        // THEN
    }

    @Test
    void testCreateFeedBackWithoutMandatoriesDatas() {
        // GIVEN
        FeedBackPostMessage feedBackPostMessage = FeedBackPostMessage.builder().activationDocumentMrid("AJB12-340K-AHVTE-2345").feedback("feedback")
                .feedbackElements("").build();

        // WHEN
        Assertions.assertThrows(BusinessException.class, () -> feedBackService.postMessage(feedBackPostMessage));

        // THEN
        verifyNoInteractions(contract);
    }

}
