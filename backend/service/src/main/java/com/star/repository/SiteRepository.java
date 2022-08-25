package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.site.Site;
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
    public static final String UPDATE_SITE = "UpdateSite";
    public static final String SITE_EXISTS = "SiteExists";
    public static final String GET_SITE_BY_QUERY = "GetSitesByQuery";

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
        log.info("Sauvegarde de {} sites", sites.size());
        return writeSitesToBc(sites, CREATE_SITE);
    }


    public List<Site> updateSites(List<Site> sites) throws TechnicalException, BusinessException {
        if (CollectionUtils.isEmpty(sites)) {
            return Collections.emptyList();
        }
        log.info("Modification de {} sites", sites.size());
        return writeSitesToBc(sites, UPDATE_SITE);
    }

    private List<Site> writeSitesToBc(List<Site> sites, String bcApiName) throws TechnicalException {
        for (Site site : sites) {
            if (site != null) {
                try {
                    contract.submitTransaction(bcApiName, objectMapper.writeValueAsString(site));
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

    public Site[] findSiteByQuery(String query) throws BusinessException, TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_SITE_BY_QUERY, query);
            return response != null ? objectMapper.readValue(new String(response), new TypeReference<Site[]>() {
            }) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des sites", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
