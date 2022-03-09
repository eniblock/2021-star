package com.star.models;

import com.star.models.site.Site;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class SiteTest {

    @Test
    void testSiteHTAWithNullMeteringPointMrId() {
        // GIVEN

        // WHEN
        boolean isSiteHTA = Site.isSiteHTA(null);

        // THEN
        assertThat(isSiteHTA).isFalse();
    }


    @Test
    void testSiteHTAWithWrongMeteringPointMrId() {
        // GIVEN
        String meteringPointMrid = "xx";
        // WHEN
        boolean isSiteHTA = Site.isSiteHTA(meteringPointMrid);

        // THEN
        assertThat(isSiteHTA).isFalse();
    }


    @Test
    void testSiteHTAOk() {
        // GIVEN
        String meteringPointMrid = "PRM30001510803649";

        // WHEN
        boolean isSiteHTA = Site.isSiteHTA(meteringPointMrid);

        // THEN
        assertThat(isSiteHTA).isTrue();
    }

    @Test
    void testSiteHTBWithNullMeteringPointMrId() {
        // GIVEN

        // WHEN
        boolean isSiteHTB = Site.isSiteHTB(null);

        // THEN
        assertThat(isSiteHTB).isFalse();
    }


    @Test
    void testSiteHTBWithWrongMeteringPointMrId() {
        // GIVEN
        String meteringPointMrid = "BB";
        // WHEN
        boolean isSiteHTB = Site.isSiteHTB(meteringPointMrid);

        // THEN
        assertThat(isSiteHTB).isFalse();
    }


    @Test
    void testSiteHTBPdlOk() {
        // GIVEN
        String meteringPointMrid = "PDL30001545273649";

        // WHEN
        boolean isSiteHTB = Site.isSiteHTB(meteringPointMrid);

        // THEN
        assertThat(isSiteHTB).isTrue();
    }


    @Test
    void testSiteHTBCartOk() {
        // GIVEN
        String meteringPointMrid = "CART6846845273649";

        // WHEN
        boolean isSiteHTB = Site.isSiteHTB(meteringPointMrid);

        // THEN
        assertThat(isSiteHTB).isTrue();
    }
}
