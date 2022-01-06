package com.star.models.producer;

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
public class Producer implements ImportCSV {

    private String docType;

    @NotBlank(message = "Le champ producerMarketParticipantMrid est obligatoire")
    private String producerMarketParticipantMrid;

    @NotBlank(message = "Le champ producerMarketParticipantName est obligatoire")
    private String producerMarketParticipantName;

    @NotBlank(message = "Le champ producerMarketParticipantRoleType est obligatoire")
    private String producerMarketParticipantRoleType;
    @JsonIgnore
    private final List<String> headers = Arrays.asList(
            "producerMarketParticipantMrid",
            "producerMarketParticipantName",
            "producerMarketParticipantRoleType"
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
        this.producerMarketParticipantMrid = csvRecord.get(headers.get(0));
        this.producerMarketParticipantName = csvRecord.get(headers.get(1));
        this.producerMarketParticipantRoleType = csvRecord.get(headers.get(2));
    }

}
//producerMarketParticipantMrid;producerMarketParticipantName;producerMarketParticipantRoleType
//        EolienFRvert28EIC;EolienFR vert Cie;A21