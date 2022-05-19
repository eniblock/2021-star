package com.star.enums;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum DocTypeEnum {
    SITE("site", "_design/indexSiteDoc"),
    PRODUCER("producer", "_design/indexProducerMarketParticipantDoc"),
    ACTIVATION_DOCUMENT("activationDocument", "_design/indexActivationDocumentDoc"),
    ENERGY_ACCOUNT("energyAccount", "_design/indexEnergyAccountDoc"),
    ENERGY_AMOUNT("energyAmount", "_design/indexEnergyAmountDoc"),
    YELLOW_PAGES("yellowPages", "_design/indexYellowPagesDoc");
    private String docType;
    private String indexName;


    DocTypeEnum(String docType, String indexName) {
        this.docType = docType;
        this.indexName = indexName;
    }

    public String getDocType() {
        return docType;
    }

    public String getIndexName() {
        return indexName;
    }
}
