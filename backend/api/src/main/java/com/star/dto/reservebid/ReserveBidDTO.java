package com.star.dto.reservebid;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

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
    private String messageType;
    private String processType;
    private String senderMarketParticipantMrid;
    private String receiverMarketParticipantMrid;
    private String createdDateTime;
    private String validityPeriodStartDateTime;
    private String validityPeriodEndDateTime;
    private String businessType;
    private String quantityMeasureUnitName;
    private String priceMeasureUnitName;
    private String currencyUnitName;
    private String flowDirection;
    @NotNull(message = "Le champ energyPriceAmount est obligatoire")
    private Float energyPriceAmount;
}
