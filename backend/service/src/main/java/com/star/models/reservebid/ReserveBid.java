package com.star.models.reservebid;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReserveBid {

    @JsonIgnore
    private String docType;
    private String reserveBidMrid;
    @NotBlank(message = "Le champ meteringPointMrid est obligatoire")
    private String meteringPointMrid;
    private String revisionNumber;
    @NotBlank(message = "Le champ messageType est obligatoire")
    private String messageType;
    @NotBlank(message = "Le champ processType est obligatoire")
    private String processType;
    @NotBlank(message = "Le champ senderMarketParticipantMrid est obligatoire")
    private String senderMarketParticipantMrid;
    @NotBlank(message = "Le champ receiverMarketParticipantMrid est obligatoire")
    private String receiverMarketParticipantMrid;
    @NotBlank(message = "Le champ createdDateTime est obligatoire")
    private String createdDateTime;
    private String validityPeriodStartDateTime;
    private String validityPeriodEndDateTime;
    private String businessType;
    private String quantityMeasureUnitName;
    @NotBlank(message = "Le champ priceMeasureUnitName est obligatoire")
    private String priceMeasureUnitName;
    @NotBlank(message = "Le champ currencyUnitName est obligatoire")
    private String currencyUnitName;
    private String flowDirection;
    @NotBlank(message = "Le champ energyPriceAmount est obligatoire")
    private String energyPriceAmount;
    private List<String> attachments;
    private List<AttachmentFileWithStatus> attachmentsWithStatus;



//    private String energyAccountMarketDocumentMrid;
//    @NotBlank(message = "Le champ meteringPointMrid est obligatoire")
//    private String meteringPointMrid;
//    private String marketEvaluationPointMrid;
//    private String revisionNumber;
//    private String businessType;
//    private String docStatus;
//    private String processType;
//    private String classificationType;
//    private String product;
//    @NotBlank(message = "Le champ areaDomain est obligatoire")
//    private String areaDomain;
//    @NotBlank(message = "Le champ receiverMarketParticipantMrid est obligatoire")
//    private String receiverMarketParticipantMrid;
//    @NotBlank(message = "Le champ receiverMarketParticipantRole est obligatoire")
//    private String receiverMarketParticipantRole;
//    @NotBlank(message = "Le champ senderMarketParticipantMrid est obligatoire")
//    private String senderMarketParticipantMrid;
//    @NotBlank(message = "Le champ senderMarketParticipantRole est obligatoire")
//    private String senderMarketParticipantRole;
//    @NotBlank(message = "Le champ createdDateTime est obligatoire")
//    @Pattern(regexp = ValidationRegex.DATETIME_REGEX, message = "Le champ createdDateTime doit être au format : " + ValidationRegex.DATETIME_REGEX_STR)
//    private String createdDateTime;
//    @NotBlank(message = "Le champ measurementUnitName est obligatoire")
//    private String measurementUnitName;
//    @Pattern(regexp = ValidationRegex.RESOLUTION_REGEX, message = "Le champ resolution doit être au format : " + ValidationRegex.RESOLUTION_REGEX_STR)
//    private String resolution;
//    @NotBlank(message = "Le champ timeInterval est obligatoire")
//    @Pattern(regexp = ValidationRegex.DATETIME_INTERVAL_REGEX, message = "Le champ timeInterval doit être au format : " + ValidationRegex.DATETIME_INTERVAL_REGEX_STR)
//    private String timeInterval;
//    private String startCreatedDateTime;
//    private String endCreatedDateTime;
//    @NotNull(message = "Le champ timeSeries est obligatoire")
//    @NotEmpty(message = "Le champ timeSeries ne doit pas être vide")
//    private List<EnergyAccountPoint> timeSeries;

}