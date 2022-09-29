package com.star.models.reservebid;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
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
public class ReserveBid {

    @JsonIgnore
    private String docType;
    private String reserveBidMrid;
    @NotBlank(message = "Le champ meteringPointMrid est obligatoire")
    private String meteringPointMrid;
    @JsonIgnore
    private String revisionNumber;
    @JsonIgnore
    private String messageType;
    @JsonIgnore
    private String processType;
    @JsonIgnore
    private String senderMarketParticipantMrid;
    @JsonIgnore
    private String receiverMarketParticipantMrid;
    private String createdDateTime;
    @JsonIgnore
    private String validityPeriodStartDateTime;
    @JsonIgnore
    private String validityPeriodEndDateTime;
    @JsonIgnore
    private String businessType;
    @JsonIgnore
    private String quantityMeasureUnitName;
    @JsonIgnore
    private String priceMeasureUnitName;
    @JsonIgnore
    private String currencyUnitName;
    private String flowDirection;
    @NotNull(message = "Le champ energyPriceAmount est obligatoire")
    private Float energyPriceAmount;
    @JsonIgnore
    private List<String> attachments;
    @JsonIgnore
    private List<AttachmentFileWithStatus> attachmentsWithStatus;
}
