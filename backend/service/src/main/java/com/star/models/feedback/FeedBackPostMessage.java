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
public class FeedBackPostMessage {

    @NotBlank(message = "Le champ activationDocumentMrid est obligatoire")
    private String activationDocumentMrid;

    @NotBlank(message = "Le champ feedbackElements est obligatoire")
    private String feedbackElements;

    @NotBlank(message = "Le champ feedback est obligatoire")
    private String feedback;

}
