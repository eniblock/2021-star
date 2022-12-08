package com.star.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Repository
@Slf4j
public class IndemnityStatusRepository {
    public static final String UPDATE_INDEMNITY_STATUS = "UpdateActivationDocumentIndeminityStatus";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;


    public String updateIndemnityStatus(String activationDocumentMrid) throws TechnicalException {
        try {
            byte[] response = contract.submitTransaction(UPDATE_INDEMNITY_STATUS, activationDocumentMrid);
            return new String(response);
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception) lors de la mise à jour du statut d'indemnité ", timeoutException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        } catch (InterruptedException e) {
            throw new RuntimeException("Erreur technique (Interrupted Exception) lors de la mise à jour du statut d'indemnité ", e);
        }
    }

}
