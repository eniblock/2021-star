package com.star.dto.feedback;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedBackDTO {

    private String feedbackProducerMrid;
    private String activationDocumentMrid;
    private String messageType;
    private String processsType;
    private String revisionNumber;
    private String senderMarketParticipantMrid;
    private String receiverMarketParticipantMrid;
    private String createdDateTime;
    private String validityPeriodStartDateTime;
    private String validityPeriodEndDateTime;
    private String feedback;
    private String feedbackAnswer;
    private String feedbackElements;
}
