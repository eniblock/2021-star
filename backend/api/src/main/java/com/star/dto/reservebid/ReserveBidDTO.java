package com.star.dto.reservebid;

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
public class ReserveBidDTO {
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
}
