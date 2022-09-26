package com.star.models.participant;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.star.models.imports.ImportCSV;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.csv.CSVRecord;

import javax.validation.constraints.NotBlank;
import java.util.Arrays;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemOperator implements ImportCSV {

    @JsonIgnore
    private final List<String> headers = Arrays.asList(
            "systemOperatorMarketParticipantMrid",
            "systemOperatorMarketParticipantName",
            "systemOperatorMarketParticipantRoleType"
    );
    @JsonIgnore
    private String docType;
    @NotBlank(message = "Le champ systemOperatorMarketParticipantMrid est obligatoire")
    private String systemOperatorMarketParticipantMrid;
    @NotBlank(message = "Le champ systemOperatorMarketParticipantName est obligatoire")
    private String systemOperatorMarketParticipantName;
    @NotBlank(message = "Le champ systemOperatorMarketParticipantRoleType est obligatoire")
    private String systemOperatorMarketParticipantRoleType;

    @Override
    public List<String> getHeaders() {
        return headers;
    }

    @Override
    public void setData(CSVRecord csvRecord) {
        if (csvRecord == null) {
            throw new IllegalArgumentException("Can not instantiate data from a null csvRecord");
        }
        if (csvRecord.size() > 0) {
            this.systemOperatorMarketParticipantMrid = csvRecord.get(headers.get(0));
            this.systemOperatorMarketParticipantName = csvRecord.get(headers.get(1));
            this.systemOperatorMarketParticipantRoleType = csvRecord.get(headers.get(2));
        }
    }
}
