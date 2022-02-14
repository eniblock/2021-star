package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.site.Site;
import com.star.models.site.SiteResponse;
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
@Repository
@Slf4j
public class SiteRepository {
    public static final String CREATE_SITE = "CreateSite";
    public static final String SITE_EXISTS = "SiteExists";
    public static final String GET_SITE_WITH_PAGINATION = "GetSiteWithPagination";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * @param sites
     * @return
     * @throws TechnicalException
     */
    public List<Site> saveSites(List<Site> sites) throws TechnicalException, BusinessException {
        if (CollectionUtils.isEmpty(sites)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des sites : {}", sites);
        for (Site site : sites) {
            if (site != null) {
                try {
                    contract.submitTransaction(CREATE_SITE, objectMapper.writeValueAsString(site));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création du site ", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return sites;
    }

    public boolean existSite(String meteringPointMrid) throws BusinessException, TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(SITE_EXISTS, meteringPointMrid);
            return objectMapper.readValue(response, Boolean.class);
        } catch (IOException exception) {
            throw new TechnicalException("Erreur technique lors de la vérification de l'existence du site", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }

    public SiteResponse findSiteByQuery(String query, String pageSize, String bookmark) throws BusinessException, TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_SITE_WITH_PAGINATION, query, pageSize, bookmark);
            return response != null ? objectMapper.readValue(new String(response), SiteResponse.class) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des sites", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
