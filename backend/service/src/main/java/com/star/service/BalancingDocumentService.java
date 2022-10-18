package com.star.service;

import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.balancing.BalancingDocument;
import com.star.models.balancing.BalancingDocumentCriteria;
import com.star.repository.BalancingDocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;

import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class BalancingDocumentService {

    @Autowired
    private BalancingDocumentRepository balancingDocumentRepository;

    public List<BalancingDocument> findBalancingDocument(BalancingDocumentCriteria balancingDocumentCriteria) throws
            BusinessException, TechnicalException {
        Assert.notNull(balancingDocumentCriteria, "Balancing document criteria must not be null");
        log.info("Recherche des balancing document à partir des critères : {}", balancingDocumentCriteria);
        if (isBlank(balancingDocumentCriteria.getActivationDocumentMrid()) &&
                isBlank(balancingDocumentCriteria.getStartCreatedDateTime()) &&
                isBlank(balancingDocumentCriteria.getEndCreatedDateTime()) &&
                isBlank(balancingDocumentCriteria.getMeteringPointMrid())) {
            throw new BusinessException("You must enter at least one search criteria");
        }
        return balancingDocumentRepository.findBalancingDocumentByCriteria(balancingDocumentCriteria);
    }
}
