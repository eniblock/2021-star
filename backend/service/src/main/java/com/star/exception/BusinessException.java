package com.star.exception;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class BusinessException extends RuntimeException {
    public BusinessException(final String message) {
        super(message);
    }
}
