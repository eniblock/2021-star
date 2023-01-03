package com.star.dto.indemnityStatus;

import io.swagger.v3.oas.annotations.media.Schema;
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
public class IndemnityStatusUpdateDTO {

    @Schema(description = "The activationDocumentMrid", example = "d9319ded-cc25-4df6-bad5-8a50c3f039fe")
    @NotBlank(message = "Le champ activationDocumentMrid est obligatoire")
    private String activationDocumentMrid;
}
