package com.star.service;

import com.star.exception.TechnicalException;
import com.star.repository.IndemnityStatusRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.Validation;
import javax.validation.ValidatorFactory;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Service
public class IndemnityStatusService {

    @Autowired
    private IndemnityStatusRepository indemnityStatusRepository;

    /**
     * Permet de modifier un statut d'indemnité
     * <p>
     * feedBackPostMessage
     */
    public String updateIndemnityStatus(String activationDocumentMrid) throws TechnicalException {
        return indemnityStatusRepository.updateIndemnityStatus(activationDocumentMrid);
    }

    public String manageActivationDocumentAbandon(String activationDocumentMrid) throws TechnicalException {
        return indemnityStatusRepository.manageActivationDocumentAbandon(activationDocumentMrid);
    }

}
