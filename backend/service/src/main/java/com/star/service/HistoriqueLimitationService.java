package com.star.service;

import com.star.models.common.PageHLF;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Service
@Slf4j
public class HistoriqueLimitationService {
    public PageHLF<HistoriqueLimitation> findHistorique(HistoriqueLimitationCriteria criteria, String bookmark, PageRequest pageRequest) {
        return null;
    }

}
