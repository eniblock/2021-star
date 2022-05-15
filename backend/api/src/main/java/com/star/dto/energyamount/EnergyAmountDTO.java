package com.star.dto.energyamount;

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
public class EnergyAmountDTO {
    private String energyAmountMarketDocumentMrid;
    private String activationDocumentMrid;
    private String registeredResourceMrid;
    private String quantity;
    private String measurementUnitName;
    private String revisionNumber;
    private String businessType;
    private String docStatus;
    private String processType;
    private String classificationType;
    private String areaDomain;
    private String senderMarketParticipantMrid;
    private String senderMarketParticipantRole;
    private String receiverMarketParticipantMrid;
    private String receiverMarketParticipantRole;
    private String createdDateTime;
    private String timeInterval;

}
