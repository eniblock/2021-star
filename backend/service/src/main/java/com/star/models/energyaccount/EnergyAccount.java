package com.star.models.energyaccount;

import com.star.custom.validations.ValueOfEnum;
import com.star.enums.MeasurementUnitTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnergyAccount {

    private String docType;
    @NotBlank(message = "Le champ energyAccountMarketDocumentMrid est obligatoire")
    private String energyAccountMarketDocumentMrid;
    @NotBlank(message = "Le champ meteringPointMrid est obligatoire")
    private String meteringPointMrid;
    private String marketEvaluationPointMrid;
    private String revisionNumber;
    private String businessType;
    private String docStatus;
    private String processType;
    private String classificationType;
    private String product;
    @NotBlank(message = "Le champ areaDomain est obligatoire")
    private String areaDomain;
    @NotBlank(message = "Le champ receiverMarketParticipantMrid est obligatoire")
    private String receiverMarketParticipantMrid;
    @NotBlank(message = "Le champ receiverMarketParticipantRole est obligatoire")
    private String receiverMarketParticipantRole;
    @NotBlank(message = "Le champ senderMarketParticipantMrid est obligatoire")
    private String senderMarketParticipantMrid;
    @NotBlank(message = "Le champ senderMarketParticipantRole est obligatoire")
    private String senderMarketParticipantRole;
    @NotBlank(message = "Le champ createdDateTime est obligatoire")
    private String createdDateTime;
    @NotBlank(message = "Le champ measurementUnitName est obligatoire")
    private String measurementUnitName;
    private String resolution;
    @NotBlank(message = "Le champ timeInterval est obligatoire")
    private String timeInterval;
    @NotNull(message = "Le champ timeSeries est obligatoire")
    @NotEmpty(message = "Le champ timeSeries ne doit pas être vide")
    private List<EnergyAccountPoint> timeSeries;
}