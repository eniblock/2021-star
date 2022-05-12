package com.star.models.energyaccount;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.star.models.common.ValidationRegex;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
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

    @JsonIgnore
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
    @Pattern(regexp = ValidationRegex.DATETIME_REGEX, message = "Le champ createdDateTime doit être au format : " + ValidationRegex.DATETIME_REGEX_STR)
    private String createdDateTime;
    @NotBlank(message = "Le champ measurementUnitName est obligatoire")
    private String measurementUnitName;
    @Pattern(regexp = ValidationRegex.RESOLUTION_REGEX, message = "Le champ resolution doit être au format : " + ValidationRegex.RESOLUTION_REGEX_STR)
    private String resolution;
    @NotBlank(message = "Le champ timeInterval est obligatoire")
    @Pattern(regexp = ValidationRegex.DATETIME_INTERVAL_REGEX, message = "Le champ timeInterval doit être au format : " + ValidationRegex.DATETIME_INTERVAL_REGEX_STR)
    private String timeInterval;
    private String startCreatedDateTime;
    private String endCreatedDateTime;
    @NotNull(message = "Le champ timeSeries est obligatoire")
    @NotEmpty(message = "Le champ timeSeries ne doit pas être vide")
    private List<EnergyAccountPoint> timeSeries;

}