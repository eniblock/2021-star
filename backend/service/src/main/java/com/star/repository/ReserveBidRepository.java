package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.producer.Producer;
import com.star.models.reservebid.AttachmentFile;
import com.star.models.reservebid.ReserveBid;
import com.star.models.reservebid.ReserveBidMarketDocumentCreation;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Repository
@Slf4j
public class ReserveBidRepository {
    public static final String CREATE_RESERVE_BID_MARKET_DOCUMENT = "CreateReserveBidMarketDocument";
    public static final String GET_RESERVE_BID = "getReserveBidMarketDocumentBySite";
    public static final String GET_FILE_BY_ID = "GetFileById";

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
        log.debug("Sauvegarde de {} reserve bid ", reserveBidMarketDocumentCreation);
        try {
            contract.submitTransaction(CREATE_RESERVE_BID_MARKET_DOCUMENT, objectMapper.writeValueAsString(reserveBidMarketDocumentCreation));
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception) lors de la création du reserve bid ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) lors de la création du reserve bid ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) lors de la création du reserve bid ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return reserveBidMarketDocumentCreation;
    }


    public List<ReserveBid> getReserveBid(String meteringPointMrid) throws TechnicalException, BusinessException {
        try {
            byte[] response = contract.evaluateTransaction(GET_RESERVE_BID, meteringPointMrid);
            return response != null ? Arrays.asList(objectMapper.readValue(new String(response), ReserveBid[].class)) : Collections.emptyList();
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des reserves bid", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }

    public AttachmentFile getFile(String fileId) throws TechnicalException, BusinessException {
        try {
            byte[] response = contract.evaluateTransaction(GET_FILE_BY_ID, fileId);
            return response != null ? objectMapper.readValue(new String(response), AttachmentFile.class) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche du fichier", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
