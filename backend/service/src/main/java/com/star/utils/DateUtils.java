package com.star.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public final class DateUtils {

    public final static DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private DateUtils() {
    }

    public static LocalDateTime toLocalDateTime(String date) throws DateTimeParseException {
        if (date == null || date.equals("")) {
            return null;
        }
        return LocalDateTime.parse(date, DATETIME_FORMATTER);
    }

    public static String toJson(LocalDateTime date) {
        if (date == null || date.equals("")) {
            return null;
        }
        return date.format(DATETIME_FORMATTER);
    }
}
