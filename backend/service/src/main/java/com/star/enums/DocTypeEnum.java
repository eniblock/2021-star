package com.star.enums;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum DocTypeEnum {
    SITE("site", "_design/indexSiteDoc"),
    PRODUCER("producer", "_design/indexProducerMarketParticipantDoc");
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
