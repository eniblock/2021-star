package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.TechnicalException;
import com.star.models.producer.Producer;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.io.IOException;
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

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les producers dans la blockchain
     *
     * @param producers liste des producers à enregistrer dans la blockchain
     * @param userId
     * @return
     * @throws TechnicalException
     */
    public List<Producer> saveProducers(List<Producer> producers, String userId) throws TechnicalException {
        if (CollectionUtils.isEmpty(producers)) {
            return Collections.emptyList();
        }
        log.info("Utilisateur {}. Sauvegarde des producers : {}", userId, producers);
        for (Producer producer : producers) {
            if (producer != null) {
                try {
                    contract.submitTransaction(CREATE_PRODUCER, objectMapper.writeValueAsString(producer));
                } catch (ContractException | TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur lors de création du producer", exception);
                }
            }
        }
        return producers;
    }

    /**
     * Permet de consulter la liste des producers
     *
     * @return la liste des producers
     * @throws TechnicalException
     */
    public List<Producer> getProducers() throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ALL_PRODUCER);
            List<Producer> producers = Collections.emptyList();
            if (response != null) {
                producers = Arrays.asList(objectMapper.readValue(new String(response), Producer[].class));
            }
            return producers;
        } catch (ContractException | IOException exception) {
            throw new TechnicalException("Erreur lors de la récupération des producers", exception);
        }
    }
}