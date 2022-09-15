package com.star.service;

import com.star.exception.TechnicalException;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import com.star.models.historiquelimitation.HistoriqueLimitationCriteria;
import com.star.repository.HistoriqueLimitationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Service
@Slf4j
public class HistoriqueLimitationService {

    @Autowired
    private HistoriqueLimitationRepository historiqueLimitationRepository;

    public HistoriqueLimitation[] findHistorique(HistoriqueLimitationCriteria criteria) throws TechnicalException {
        log.debug("Recherche des historiques de limitation avec les critères : {}", criteria);
        return historiqueLimitationRepository.findHistoriqueByQuery(criteria);
    }
}
