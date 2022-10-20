package com.star.dto.historiquelimitation;

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
public class BalancingDocumentDTO {
    private String docType;
    private String balancingDocumentMrid;
    private String activationDocumentMrid;
    private String energyAmountMarketDocumentMrid;
    private String reserveBidMrid;
    private String revisionNumber;
    private String messageType;
    private String processsType;
    private String senderMarketParticipantMrid;
    private String receiverMarketParticipantMrid;
    private String createdDateTime;
    private String period;
    private String businessType;
    private String quantityMeasureUnitName;
    private String priceMeasureUnitName;
    private String currencyUnitName;
    private String meteringPointMrid;
    private String direction;
    private int quantity;
    private int activationPriceAmount;
    private int financialPriceAmount;
}