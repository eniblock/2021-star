package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.PageHLF;
import com.star.models.historiquelimitation.HistoriqueLimitation;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class HistoriqueLimitationRepository {

    public static final String GET_HISTORIQUE_WITH_PAGINATION = "GetHistoriqueWithPagination";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    public HistoriqueLimitation[] findHistoriqueByQuery(String query) throws BusinessException, TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_HISTORIQUE_WITH_PAGINATION, query);
            return response != null ? objectMapper.readValue(new String(response), new TypeReference<HistoriqueLimitation[]>() {
            }) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des historiques de limitation", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
