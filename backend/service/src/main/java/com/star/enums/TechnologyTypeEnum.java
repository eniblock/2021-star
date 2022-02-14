package com.star.enums;

import java.util.Arrays;

import static org.apache.commons.lang3.StringUtils.equalsIgnoreCase;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum TechnologyTypeEnum {

    EOLIEN("Eolien"),
    PHOTOVOLTAIQUE("Photovoltaïque");

    private String value;

    TechnologyTypeEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }

    @Override
    public String toString() {
        return this.value;
    }

    public static TechnologyTypeEnum fromValue(String value) {
        for (TechnologyTypeEnum technologyTypeEnum : TechnologyTypeEnum.values()) {
            if (equalsIgnoreCase(technologyTypeEnum.value, value) || equalsIgnoreCase(technologyTypeEnum.name(), value)) {
                return technologyTypeEnum;
            }
        }
        throw new IllegalArgumentException("Unkown enum " + value + " , only allowed values are " + Arrays.toString(values()));
    }
}