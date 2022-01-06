package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.TechnicalException;
import com.star.models.site.dso.SiteDso;
import com.star.models.site.dso.SiteDsoResponse;
import com.star.models.site.tso.SiteTso;
import com.star.models.site.tso.SiteTsoResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.io.IOException;
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
     * @param siteDsos
     * @return
     * @throws TechnicalException
     */
    public List<SiteDso> saveSiteDso(List<SiteDso> siteDsos) throws TechnicalException {
        if (CollectionUtils.isEmpty(siteDsos)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des sites dso : {}", siteDsos);
        for (SiteDso siteDso : siteDsos) {
            if (siteDso != null) {
                try {
                    contract.submitTransaction(CREATE_SITE, objectMapper.writeValueAsString(siteDso));
                } catch (ContractException | TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur lors de création du site DSO", exception);
                }
            }
        }
        return siteDsos;
    }

    public boolean existSite(String meteringPointMrid) throws TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(SITE_EXISTS, meteringPointMrid);
            return objectMapper.readValue(response, Boolean.class);
        } catch (ContractException | IOException exception) {
            throw new TechnicalException("Erreur lors de la recherche du site", exception);
        }
    }

    public SiteDsoResponse findSiteDsoByQuery(String query, String pageSize, String bookmark) throws ContractException, JsonProcessingException {
        byte[] response = contract.evaluateTransaction(GET_SITE_WITH_PAGINATION, query, pageSize, bookmark);
        return response != null ? objectMapper.readValue(new String(response), SiteDsoResponse.class) : null;
    }

    /**
     * @param siteTsos
     * @return
     * @throws TechnicalException
     */
    public List<SiteTso> saveSiteTso(List<SiteTso> siteTsos) throws TechnicalException {
        if (CollectionUtils.isEmpty(siteTsos)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde des sites tso : {}", siteTsos);
        for (SiteTso siteTso : siteTsos) {
            if (siteTso != null) {
                try {
                    contract.submitTransaction(CREATE_SITE, objectMapper.writeValueAsString(siteTso));
                } catch (ContractException | TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur lors de création du site TSO", exception);
                }
            }
        }
        return siteTsos;
    }

    public SiteTsoResponse findSiteTsoByQuery(String query, String pageSize, String bookmark) throws ContractException, JsonProcessingException {
        byte[] response = contract.evaluateTransaction(GET_SITE_WITH_PAGINATION, query, pageSize, bookmark);
        return response != null ? objectMapper.readValue(new String(response), SiteTsoResponse.class) : null;
    }
}
