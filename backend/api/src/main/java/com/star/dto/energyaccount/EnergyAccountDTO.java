package com.star.dto.energyaccount;

import com.star.models.energyaccount.EnergyAccountPoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnergyAccountDTO {
    private String energyAccountMarketDocumentMrid;
    private String meteringPointMrid;
    private String marketEvaluationPointMrid;
    private String revisionNumber;
    private String businessType;
    private String docStatus;
    private String processType;
    private String classificationType;
    private String product;
    private String areaDomain;
    private String receiverMarketParticipantMrid;
    private String receiverMarketParticipantRole;
    private String senderMarketParticipantMrid;
    private String senderMarketParticipantRole;
    private String createdDateTime;
    private String measurementUnitName;
    private String resolution;
    private String timeInterval;
    private String startCreatedDateTime;
    private String endCreatedDateTime;
    private List<EnergyAccountPoint> timeSeries;

}