package com.star.models.energyamount;

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
public class EnergyAmount {

    @JsonIgnore
    private String docType;

    private String energyAmountMarketDocumentMrid;

    @NotBlank(message = "Le champ activationDocumentMrid est obligatoire")
    private String activationDocumentMrid;

    private String registeredResourceMrid;

    @NotBlank(message = "Le champ quantity est obligatoire")
    private String quantity;

    @NotBlank(message = "Le champ measurementUnitName est obligatoire")
    private String measurementUnitName;

    private String revisionNumber;

    private String businessType;

    private String docStatus;

    private String processType;

    private String classificationType;

    @NotBlank(message = "Le champ areaDomain est obligatoire")
    private String areaDomain;

    @NotBlank(message = "Le champ senderMarketParticipantMrid est obligatoire")
    private String senderMarketParticipantMrid;

    @NotBlank(message = "Le champ senderMarketParticipantRole est obligatoire")
    private String senderMarketParticipantRole;

    @NotBlank(message = "Le champ receiverMarketParticipantMrid est obligatoire")
    private String receiverMarketParticipantMrid;

    @NotBlank(message = "Le champ receiverMarketParticipantRole est obligatoire")
    private String receiverMarketParticipantRole;

    @NotBlank(message = "Le champ createdDateTime est obligatoire")
    private String createdDateTime;

    @NotBlank(message = "Le champ timeInterval est obligatoire")
    private String timeInterval;

}