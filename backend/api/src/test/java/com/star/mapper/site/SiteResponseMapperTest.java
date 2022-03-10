package com.star.mapper.site;

import com.star.dto.site.SiteDTOResponse;
import com.star.models.site.SiteResponse;
import com.star.rest.AbstractIntTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteResponseMapperTest extends AbstractIntTest {

    @Autowired
    private SiteResponseMapper siteResponseMapper;

    @Test
    void mapperSiteResponseTest() {
        // GIVEN
        SiteResponse siteResponse = new SiteResponse();
        siteResponse.setBookmark(SiteResponseMapper.NIL);

        SiteDTOResponse siteDTOResponse = siteResponseMapper.beanToDto(siteResponse);
        // WHEN

        // THEN
        assertThat(siteDTOResponse.getBookmark()).isNull();
        assertThat(siteDTOResponse.getContent()).isNotNull();
        assertThat(siteDTOResponse.getContent()).isEmpty();
    }
}
