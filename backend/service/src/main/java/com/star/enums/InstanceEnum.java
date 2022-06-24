package com.star.enums;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum InstanceEnum {
    TSO("tso", "10XFR-RTE------Q"),
    DSO("dso", "17X100A100A0001A"),
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
