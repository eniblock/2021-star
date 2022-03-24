package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.yellowpages.YellowPages;
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
public class YellowPagesRepository {
    public static final String CREATE_YELLOW_PAGES = "CreateYellowPages";
    public static final String GET_ALL_YELLOW_PAGES = "GetAllYellowPages";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les yellow pages dans la blockchain
     *
     * @param yellowPages liste des yellow pages à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public List<YellowPages> saveYellowPages(List<YellowPages> yellowPages) throws BusinessException, TechnicalException {
        if (CollectionUtils.isEmpty(yellowPages)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des producers : {}", yellowPages);
        for (YellowPages yellowPage : yellowPages) {
            if (yellowPage != null) {
                try {
                    contract.submitTransaction(CREATE_YELLOW_PAGES, objectMapper.writeValueAsString(yellowPage));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création du producer ", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return yellowPages;
    }

    /**
     * Permet de consulter la liste des producers
     *
     * @return
     * @throws TechnicalException
     * @throws BusinessException
     */
    public List<YellowPages> getYellowPages() throws TechnicalException, BusinessException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ALL_YELLOW_PAGES);
            return response != null ? Arrays.asList(objectMapper.readValue(new String(response), YellowPages[].class)) : Collections.emptyList();
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des producers", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}