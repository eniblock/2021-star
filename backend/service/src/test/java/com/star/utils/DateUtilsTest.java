package com.star.utils;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.Month;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DateUtilsTest {

    @Test
    void toLocalDateTime() {
        // GIVEN
        var dateStr = "2022-08-12T14:15:16Z";

        // WHEN

        // THEN
        var d = DateUtils.toLocalDateTime(dateStr);
        assertEquals(2022, d.getYear());
        assertEquals(Month.AUGUST, d.getMonth());
        assertEquals(12, d.getDayOfMonth());
        assertEquals(14, d.getHour());
        assertEquals(15, d.getMinute());
        assertEquals(16, d.getSecond());
    }

    @Test
    void toJson() {
        // GIVEN
        var date = LocalDateTime.of(2022, Month.AUGUST, 12, 14, 15, 16);

        // WHEN

        // THEN
        var dateStr = DateUtils.toJson(date);
        assertEquals("2022-08-12T14:15:16Z", dateStr);
    }
}