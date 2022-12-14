package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.energyamount.EnergyAmount;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.ContractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.TimeoutException;

import static java.util.Collections.emptyList;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Slf4j
@Repository
public class EnergyAmountRepository {
    public static final String CREATE_TSO_ENERGY_AMOUNT_LIST = "CreateTSOEnergyAmountList";
    public static final String CREATE_DSO_ENERGY_AMOUNT_LIST = "CreateDSOEnergyAmountList";
    public static final String UPDATE_TSO_ENERGY_AMOUNT_LIST = "UpdateTSOEnergyAmountList";
    public static final String UPDATE_DSO_ENERGY_AMOUNT_LIST = "UpdateDSOEnergyAmountList";
    public static final String GET_ENERGY_AMOUNT_WITH_PAGINATION = "GetEnergyAmountWithPagination";

    @Autowired
    private Contract contract;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Permet d'enregistrer les energy accounts dans la blockchain
     *
     * @param energyAmounts liste des energy accounts à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public List<EnergyAmount> save(List<EnergyAmount> energyAmounts, InstanceEnum instance) throws TechnicalException {
        if (CollectionUtils.isEmpty(energyAmounts)) {
            return emptyList();
        }
        log.info("Sauvegarde de {} energy amounts", energyAmounts.size());
        if (InstanceEnum.DSO.equals(instance)) {
            writeEnergyAmountsToBc(energyAmounts, CREATE_DSO_ENERGY_AMOUNT_LIST);
        } else {
            writeEnergyAmountsToBc(energyAmounts, CREATE_TSO_ENERGY_AMOUNT_LIST);
        }
        return energyAmounts;
    }

    /**
     * Permet de modifier les energy accounts dans la blockchain
     *
     * @param energyAmounts liste des energy accounts à enregistrer dans la blockchain
     * @return
     * @throws BusinessException
     * @throws TechnicalException
     */
    public List<EnergyAmount> update(List<EnergyAmount> energyAmounts, InstanceEnum instance) throws TechnicalException {
        if (CollectionUtils.isEmpty(energyAmounts)) {
            return emptyList();
        }
        log.info("Modification des energy amounts : {}", energyAmounts);
        if (InstanceEnum.DSO.equals(instance)) {
            writeEnergyAmountsToBc(energyAmounts, UPDATE_DSO_ENERGY_AMOUNT_LIST);
        } else {
            writeEnergyAmountsToBc(energyAmounts, UPDATE_TSO_ENERGY_AMOUNT_LIST);
        }
        return energyAmounts;
    }

    private List<EnergyAmount> writeEnergyAmountsToBc(List<EnergyAmount> energyAmounts, String bcApiName) throws TechnicalException {
        try {
            contract.submitTransaction(bcApiName, objectMapper.writeValueAsString(energyAmounts));
        } catch (TimeoutException timeoutException) {
            throw new TechnicalException("Erreur technique (Timeout exception) lors de l'enregistrement de l'energy amount ", timeoutException);
        } catch (InterruptedException interruptedException) {
            log.error("Erreur technique (Interrupted Exception) lors de l'enregistrement de l'energy amount ", interruptedException);
            Thread.currentThread().interrupt();
        } catch (JsonProcessingException jsonProcessingException) {
            throw new TechnicalException("Erreur technique (JsonProcessing Exception) lors de l'enregistrement de l'energy amount ", jsonProcessingException);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }

        return energyAmounts;
    }

    public EnergyAmount[] findEnergyAmountByQuery(String query) throws BusinessException, TechnicalException {
        try {
            byte[] response = contract.evaluateTransaction(GET_ENERGY_AMOUNT_WITH_PAGINATION, query);
            return response != null ? objectMapper.readValue(new String(response), new TypeReference<EnergyAmount[]>() {
            }) : null;
        } catch (JsonProcessingException exception) {
            throw new TechnicalException("Erreur technique lors de la recherche des energy amounts", exception);
        } catch (ContractException contractException) {
            throw new BusinessException(contractException.getMessage());
        }
    }
}
