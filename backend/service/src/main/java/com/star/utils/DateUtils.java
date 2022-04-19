package com.star.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public final class DateUtils {
    private DateUtils() {
    }

    public static LocalDateTime getLocalDateTime(String date) throws DateTimeParseException {
        if (date == null || date.equals("")) {
            return null;
        }
        try {
            return LocalDateTime.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
        } catch (DateTimeParseException dateTimeParseException) {
            throw dateTimeParseException;
        }
    }
}
