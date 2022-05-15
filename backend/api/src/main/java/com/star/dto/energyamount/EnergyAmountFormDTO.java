package com.star.dto.energyamount;

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
public class EnergyAmountFormDTO {

    @NotBlank(message = "Le champ activationDocumentMrid est obligatoire")
    private String activationDocumentMrid;
    private String revisionNumber;
    private String processType;
    private String businessType;
    private String classificationType;
    @NotBlank(message = "Le champ quantity est obligatoire")
    private String quantity;
    @NotBlank(message = "Le champ measurementUnitName est obligatoire")
    private String measurementUnitName;
    @NotBlank(message = "Le champ timeInterval est obligatoire")
    private String timeInterval;
}
