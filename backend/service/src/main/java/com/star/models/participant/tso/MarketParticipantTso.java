package com.star.models.participant.tso;

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
public class MarketParticipantTso implements ImportCSV {

    @NotBlank(message = "Le champ tsoMarketParticipantMrid est obligatoire")
    private String tsoMarketParticipantMrid;

    @NotBlank(message = "Le champ tsoMarketParticipantName est obligatoire")
    private String tsoMarketParticipantName;

    @NotBlank(message = "Le champ tsoMarketParticipantRoleType est obligatoire")
    private String tsoMarketParticipantRoleType;

    @JsonIgnore
    private final List<String> headers = Arrays.asList(
            "tsoMarketParticipantMrid",
            "tsoMarketParticipantName",
            "tsoMarketParticipantRoleType"
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
        this.tsoMarketParticipantMrid = csvRecord.get(headers.get(0));
        this.tsoMarketParticipantName = csvRecord.get(headers.get(1));
        this.tsoMarketParticipantRoleType = csvRecord.get(headers.get(2));
    }
}
