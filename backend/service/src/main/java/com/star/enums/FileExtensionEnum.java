package com.star.enums;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum FileExtensionEnum {

    CSV("csv");

    private String value;

    private FileExtensionEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }

}
