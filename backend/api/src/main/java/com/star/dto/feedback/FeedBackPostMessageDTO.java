package com.star.dto.feedback;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedBackPostMessageDTO {

    @Schema(description = "The mrid of the activation document", example = "d9319ded-cc25-4df6-bad5-8a50c3f039fe")
    private String activationDocumentMrid;

    @Schema(description = "The subjects, separated by \"|\"", example = "Ordres de limitation|Courbe de référence")
    private String feedbackElements;

    @Schema(description = "The message", example = "My message")
    private String feedback;
}
