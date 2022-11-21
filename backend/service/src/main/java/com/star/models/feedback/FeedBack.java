package com.star.models.feedback;

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
public class FeedBack {
    @JsonIgnore
    private String docType;
    private String feedbackProducerMrid;
    @NotBlank(message = "Le champ activationDocumentMrid est obligatoire")
    private String activationDocumentMrid;
    @NotBlank(message = "Le champ messageType est obligatoire")
    private String messageType;
    @NotBlank(message = "Le champ processsType est obligatoire")
    private String processType;
    private String revisionNumber;
    @NotBlank(message = "Le champ senderMarketParticipantMrid est obligatoire")
    private String senderMarketParticipantMrid;
    @NotBlank(message = "Le champ receiverMarketParticipantMrid est obligatoire")
    private String receiverMarketParticipantMrid;
    private String createdDateTime;
    @NotBlank(message = "Le champ validityPeriodStartDateTime est obligatoire")
    private String validityPeriodStartDateTime;
    @NotBlank(message = "Le champ validityPeriodEndDateTime est obligatoire")
    private String validityPeriodEndDateTime;
    private String feedback;
    private String feedbackAnswer;
    private String feedbackElements;
    private String indeminityStatus;

}
