package com.star.models.yellowpages;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.star.models.imports.ImportCSV;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.csv.CSVRecord;

import javax.validation.constraints.NotBlank;
import java.util.Arrays;
import java.util.List;

import static java.util.UUID.randomUUID;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class YellowPages implements ImportCSV {

    @JsonIgnore
    private final List<String> headers = Arrays.asList(
            "originAutomationRegisteredResourceMrid",
            "registeredResourceMrid",
            "systemOperatorMarketParticipantMrid"
    );
    @JsonIgnore
    private String docType;
    @NotBlank(message = "Le champ yellowPageMrid est obligatoire")
    private String yellowPageMrid;
    @NotBlank(message = "Le champ originAutomationRegisteredResourceMrid est obligatoire")
    private String originAutomationRegisteredResourceMrid;
    @NotBlank(message = "Le champ registeredResourceMrid est obligatoire")
    private String registeredResourceMrid;
    @NotBlank(message = "Le champ systemOperatorMarketParticipantMrid est obligatoire")
    private String systemOperatorMarketParticipantMrid;

    @Override
    public List<String> getHeaders() {
        return headers;
    }

    @Override
    public void defineData(CSVRecord csvRecord) {
        if (csvRecord == null) {
            throw new IllegalArgumentException("Can not instantiate data from a null csvRecord");
        }
        this.yellowPageMrid = randomUUID().toString();
        this.originAutomationRegisteredResourceMrid = csvRecord.get(headers.get(0));
        this.registeredResourceMrid = csvRecord.get(headers.get(1));
        this.systemOperatorMarketParticipantMrid = csvRecord.get(headers.get(2));
    }

}