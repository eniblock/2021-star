package com.star.custom.validations;

import org.apache.commons.lang3.StringUtils;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class ValueOfEnumValidator implements ConstraintValidator<ValueOfEnum, String> {
    private List<String> acceptedValues;

    @Override
    public void initialize(ValueOfEnum constraintAnnotation) {
        Class<? extends Enum<?>> enumClass = constraintAnnotation.enumClass();
        acceptedValues = Arrays.asList(enumClass.getEnumConstants()).stream().map(element -> element.toString()).collect(Collectors.toList());
        acceptedValues.addAll(Arrays.asList(enumClass.getEnumConstants()).stream().map(element -> element.name()).collect(Collectors.toList()));
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext constraintValidatorContext) {
        return acceptedValues.contains(value);
    }
}