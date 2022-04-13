package com.star.mapper.site;

import com.star.dto.common.PageResponseDTO;
import com.star.models.common.PageResponse;
import com.star.models.site.Site;
import com.star.rest.AbstractIntTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SitePageMapperTest extends AbstractIntTest {

    @Autowired
    private SitePageMapper siteResponseMapper;

    @Test
    void mapperSiteResponseTest() {
        // GIVEN
        var siteResponse = new PageResponse<Site>();
        siteResponse.setBookmark(SitePageMapper.NIL);

        PageResponseDTO siteDTOResponse = siteResponseMapper.beanToDto(siteResponse);
        // WHEN

        // THEN
        assertThat(siteDTOResponse.getBookmark()).isNull();
        assertThat(siteDTOResponse.getContent()).isNotNull();
        assertThat(siteDTOResponse.getContent()).isEmpty();
    }
}
