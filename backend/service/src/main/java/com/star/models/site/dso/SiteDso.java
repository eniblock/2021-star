package com.star.models.site.dso;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.star.custom.validations.ValueOfEnum;
import com.star.enums.TechnologyTypeEnum;
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
public class SiteDso implements ImportCSV {

    private String siteId;
    @NotBlank(message = "Le champ systemOperatorMarketParticipantMrid est obligatoire")
    private String systemOperatorMarketParticipantMrid;
    @ValueOfEnum(enumClass = TechnologyTypeEnum.class, message = " must be any of Eolien/Photovoltaïque")
    private String technologyType;
    @NotBlank(message = "Le champ siteType est obligatoire")
    private String siteType;
    @NotBlank(message = "Le champ meteringPointMrid est obligatoire")
    private String meteringPointMrid;
    @NotBlank(message = "Le champ siteName est obligatoire")
    private String siteName;
    private String siteAdminMrid;
    private String siteLocation;
    private String siteIecCode;
    @NotBlank(message = "Le champ producerMarketParticipantMrid est obligatoire")
    private String producerMarketParticipantMrid;
    @NotBlank(message = "Le champ substationMrid est obligatoire")
    private String substationMrid;
    @NotBlank(message = "Le champ substationName est obligatoire")
    private String substationName;
    private String systemOperatorEntityFlexibilityDomainMrid;
    private String systemOperatorEntityFlexibilityDomainName;
    private String systemOperatorCustomerServiceName;
    private String ppeSiteCode;
    private String edpRegisteredResourceMrid;

    private String instance;
    private String producerMarketParticipantName;

    @JsonIgnore
    private final List<String> headers = Arrays.asList(
            "siteId",
            "systemOperatorMarketParticipantMrid",
            "technologyType",
            "siteType",
            "meteringPointMrid",
            "siteName",
            "siteAdminMrid",
            "siteLocation",
            "siteIecCode",
            "producerMarketParticipantMrid",
            "substationMrid",
            "substationName",
            "systemOperatorEntityFlexibilityDomainMrid",
            "systemOperatorEntityFlexibilityDomainName",
            "systemOperatorCustomerServiceName",
            "ppeSiteCode",
            "edpRegisteredResourceMrid"
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
        this.siteId = csvRecord.get(headers.get(0));
        this.systemOperatorMarketParticipantMrid = csvRecord.get(headers.get(1));
        this.technologyType = csvRecord.get(headers.get(2));
        this.siteType = csvRecord.get(headers.get(3));
        this.meteringPointMrid = csvRecord.get(headers.get(4));
        this.siteName = csvRecord.get(headers.get(5));
        this.siteAdminMrid = csvRecord.get(headers.get(6));
        this.siteLocation = csvRecord.get(headers.get(7));
        this.siteIecCode = csvRecord.get(headers.get(8));
        this.producerMarketParticipantMrid = csvRecord.get(headers.get(9));
        this.substationMrid = csvRecord.get(headers.get(10));
        this.substationName = csvRecord.get(headers.get(11));
        this.systemOperatorEntityFlexibilityDomainMrid = csvRecord.get(headers.get(12));
        this.systemOperatorEntityFlexibilityDomainName = csvRecord.get(headers.get(13));
        this.systemOperatorCustomerServiceName = csvRecord.get(headers.get(14));
        this.ppeSiteCode = csvRecord.get(headers.get(15));
        this.edpRegisteredResourceMrid = csvRecord.get(headers.get(16));
    }

}