package com.star.enums;

import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;
import java.util.List;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public enum TechnologyTypeEnum {

    EOLIEN("Eolien", "éolien,eolien"),
    PHOTOVOLTAIQUE("Photovoltaïque", "photovoltaïque,photovoltaique,Photovoltaique");

    private String label;
    private String values;

    TechnologyTypeEnum(String label, String values) {
        this.label = label;
        this.values = values;
    }

    public String getLabel() {
        return this.label;
    }

    public String getValues() {
        return this.values;
    }

    @Override
    public String toString() {
        return this.name() + "," + this.getLabel() + "," + this.getValues();
    }

    public static TechnologyTypeEnum fromValue(String value) {
        for (TechnologyTypeEnum technologyTypeEnum : TechnologyTypeEnum.values()) {
            List<String> values = Arrays.asList(StringUtils.split(technologyTypeEnum.toString(), ","));
            if (values.contains(value)) {
                return technologyTypeEnum;
            }
        }
        throw new IllegalArgumentException("Unkown enum " + value + " , only allowed values are " + Arrays.toString(values()));
    }
}