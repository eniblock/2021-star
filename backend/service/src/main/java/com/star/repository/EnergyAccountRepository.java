package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.energyaccount.EnergyAccount;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class EnergyAccountRepository {
    public static final String CREATE_LIST = "CreateEnergyAccountList";
    public static final String UPDATE_LIST = "UpdateEnergyAccountList";
    public static final String GET_ENERGY_ACCOUNT_WITH_PAGINATION = "GetEnergyAccountWithPagination";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet de stocker les energy accounts dans la blockchain
     *
     * @param energyAccounts liste des energy accounts à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public List<EnergyAccount> save(List<EnergyAccount> energyAccounts) throws TechnicalException {
        if (CollectionUtils.isEmpty(energyAccounts)) {
            return Collections.emptyList();
        }
        log.info("Sauvegarde de {} energy accounts", energyAccounts.size());
        writeEnergyAccountsToBc(energyAccounts, CREATE_LIST);
        return energyAccounts;
    }

    public List<EnergyAccount> update(List<EnergyAccount> energyAccounts) throws TechnicalException {
        if (CollectionUtils.isEmpty(energyAccounts)) {
            return Collections.emptyList();
        }
        log.info("Modification de {} energy accounts", energyAccounts.size());
        writeEnergyAccountsToBc(energyAccounts, UPDATE_LIST);
        return energyAccounts;
    }

    private List<EnergyAccount> writeEnergyAccountsToBc(List<EnergyAccount> energyAccounts, String bcApiName) throws TechnicalException {
        try {
            contract.submitTransaction(bcApiName, objectMapper.writeValueAsString(energyAccounts));
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception) lors de création de l'energy account ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) lors de création de l'energy account ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) lors de création de l'energy account ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
        return energyAccounts;
    }

    public EnergyAccount[] findEnergyAccountByQuery(String query) throws BusinessException, TechnicalException {
        log.debug("Recherche des energy account à partir de la requêtes : {}", query);
        try {
            byte[] response = contract.evaluateTransaction(GET_ENERGY_ACCOUNT_WITH_PAGINATION, query);
            return response != null ? objectMapper.readValue(new String(response), new TypeReference<EnergyAccount[]>() {
            }) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des courbes de comptage", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}