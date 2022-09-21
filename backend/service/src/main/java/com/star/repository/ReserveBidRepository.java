package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.reservebid.ReserveBidMarketDocumentCreation;
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
public class ReserveBidRepository {
    public static final String CREATE_RESERVE_BID_MARKET_DOCUMENT = "CreateReserveBidMarketDocument";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Création d'un réserve bid avec d'éventuels fichiers en pièce jointe.
     *
     * @param reserveBidMarketDocumentCreation
     * @return
     * @throws TechnicalException
     */
    public ReserveBidMarketDocumentCreation save(ReserveBidMarketDocumentCreation reserveBidMarketDocumentCreation) throws TechnicalException, BusinessException {
        if (reserveBidMarketDocumentCreation == null) {
            return null;
        }
        log.info("Sauvegarde de {} reserve bid ", reserveBidMarketDocumentCreation);
        try {
            contract.submitTransaction(CREATE_RESERVE_BID_MARKET_DOCUMENT, objectMapper.writeValueAsString(reserveBidMarketDocumentCreation));
        } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de création du reserve bid ", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return reserveBidMarketDocumentCreation;
    }
}
