package com.star.models.limitation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.star.custom.validations.ValueOfEnum;
import com.star.enums.MeasurementUnitTypeEnum;
import com.star.models.imports.ImportCSV;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.csv.CSVRecord;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Collections;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdreDebutLimitation implements ImportCSV {

    private String activationDocumentMrid;
    @NotBlank(message = "Le champ originAutomationRegisteredResourceMrid est obligatoire")
    private String originAutomationRegisteredResourceMrid;
    @NotBlank(message = "Le champ registeredResourceMrid est obligatoire")
    private String registeredResourceMrid;
    private String orderValue;
    @ValueOfEnum(enumClass = MeasurementUnitTypeEnum.class, message = " must be any of MW/KW")
    private String measurementUnitName;
    private String startCreatedDateTime;
    private String endCreatedDateTime;
    private String revisionNumber;
    @NotBlank(message = "Le champ messageType est obligatoire")
    private String messageType;
    @NotBlank(message = "Le champ businessType est obligatoire")
    private String businessType;
    private String reasonCode;
    @NotNull(message = "Le champ orderEnd est obligatoire")
    private boolean orderEnd;
    private String senderMarketParticipantMrid;
    private String receiverMarketParticipantMrid;

    @JsonIgnore
    @Override
    public List<String> getHeaders() {
        return Collections.emptyList();
    }

    @Override
    public void setData(CSVRecord csvRecord) {
//        Fichier JSON. Pas de setter ici.
    }
}
