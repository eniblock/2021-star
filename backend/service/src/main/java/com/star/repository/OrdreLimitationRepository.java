package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.limitation.OrdreDebutLimitation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class OrdreLimitationRepository {
    public static final String CREATE = "CreateActivationDocument";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les ordres de début de limitation dans la blockchain
     *
     * @param ordreDebutLimitations liste des ordres de début de limitation à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public List<OrdreDebutLimitation> saveOrdreDebutLimitations(List<OrdreDebutLimitation> ordreDebutLimitations) throws BusinessException, TechnicalException {
        if (CollectionUtils.isEmpty(ordreDebutLimitations)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des ordres de début de limitation : {}", ordreDebutLimitations);
        for (OrdreDebutLimitation ordreDebutLimitation : ordreDebutLimitations) {
            if (ordreDebutLimitation != null) {
                try {
                    contract.submitTransaction(CREATE, objectMapper.writeValueAsString(ordreDebutLimitation));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création de l'ordre de debut limitation ", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return ordreDebutLimitations;
    }
}