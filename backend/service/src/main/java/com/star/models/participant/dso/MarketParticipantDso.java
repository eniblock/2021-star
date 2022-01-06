package com.star.models.participant.dso;

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
public class MarketParticipantDso implements ImportCSV {

    @NotBlank(message = "Le champ dsoMarketParticipantMrid est obligatoire")
    private String dsoMarketParticipantMrid;

    @NotBlank(message = "Le champ dsoMarketParticipantName est obligatoire")
    private String dsoMarketParticipantName;

    @NotBlank(message = "Le champ dsoMarketParticipantRoleType est obligatoire")
    private String dsoMarketParticipantRoleType;
    @JsonIgnore
    private final List<String> headers = Arrays.asList(
            "dsoMarketParticipantMrid",
            "dsoMarketParticipantName",
            "dsoMarketParticipantRoleType"
    );

    @Override
    public List<String> getHeaders() {
        return headers;
    }

    @Override
    public void setData(CSVRecord csvRecord) {
        if (csvRecord == null) {
            throw new IllegalArgumentException("Can not instantiate data from a null csvRecord");
        }
        this.dsoMarketParticipantMrid = csvRecord.get(headers.get(0));
        this.dsoMarketParticipantName = csvRecord.get(headers.get(1));
        this.dsoMarketParticipantRoleType = csvRecord.get(headers.get(2));
    }

}
