package com.star.enums;

import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum TechnologyTypeEnum {

    EOLIEN("Eolien"),
    PHOTOVOLTAIQUE("Photovoltaïque");

    private String label;

    TechnologyTypeEnum(String label) {
        this.label = label;
    }

    public String getLabel() {
        return this.label;
    }

    @Override
    public String toString() {
        return this.name();
    }

    public static TechnologyTypeEnum fromValue(String value) {
        String element = StringUtils.upperCase(StringUtils.stripAccents(value));
        for (TechnologyTypeEnum technologyTypeEnum : TechnologyTypeEnum.values()) {
            if (StringUtils.equals(element, technologyTypeEnum.name())) {
                return technologyTypeEnum;
            }
        }
        throw new IllegalArgumentException("Unkown enum " + value + " , only allowed values are " + Arrays.toString(values()));
    }
}