package com.star.models.feedback;

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
public class FeedBackPostMessageAnswer {

    @NotBlank(message = "Le champ activationDocumentMrid est obligatoire")
    private String activationDocumentMrid;

    @NotBlank(message = "Le champ feedbackAnswer est obligatoire")
    private String feedbackAnswer;

}
