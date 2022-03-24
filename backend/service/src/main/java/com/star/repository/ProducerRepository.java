package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.producer.Producer;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
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
@Slf4j
@Repository
public class ProducerRepository {
    public static final String CREATE_PRODUCER = "CreateProducer";
    public static final String GET_ALL_PRODUCER = "GetAllProducer";
    public static final String QUERY_PRODUCER = "QueryProducer";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les producers dans la blockchain
     *
     * @param producers liste des producers à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public List<Producer> saveProducers(List<Producer> producers) throws BusinessException, TechnicalException {
        if (CollectionUtils.isEmpty(producers)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des producers : {}", producers);
        for (Producer producer : producers) {
            if (producer != null) {
                try {
                    contract.submitTransaction(CREATE_PRODUCER, objectMapper.writeValueAsString(producer));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création du producer ", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return producers;
    }

    /**
     * Permet de consulter la liste des producers
     *
     * @return
     * @throws TechnicalException
     * @throws BusinessException
     */
    public List<Producer> getProducers() throws TechnicalException, BusinessException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ALL_PRODUCER);
            return response != null ? Arrays.asList(objectMapper.readValue(new String(response), Producer[].class)) : Collections.emptyList();
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des producers", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }

    public Producer getProducer(String producerMarketParticipantMrid) throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(QUERY_PRODUCER, producerMarketParticipantMrid);
            return response != null ? objectMapper.readValue(new String(response), Producer.class) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des producers", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}