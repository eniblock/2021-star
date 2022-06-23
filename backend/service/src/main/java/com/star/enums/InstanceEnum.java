package com.star.enums;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum InstanceEnum {
    TSO("tso", "17V0000008957464"),
    DSO("dso", "17V0000009927464"),
    PRODUCER("producer", "");

    private String value;
    private String systemOperatorMrid;

    private InstanceEnum(String value, String systemOperatorMrid) {
        this.value = value;
        this.systemOperatorMrid = systemOperatorMrid;
    }

    public String getValue() {
        return this.value;
    }

    public String getSystemOperatorMrid() {
        return this.systemOperatorMrid;
    }
}
