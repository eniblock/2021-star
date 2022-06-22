package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.PageHLF;
import com.star.models.energyamount.EnergyAmount;
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
public class EnergyAmountRepository {
    public static final String CREATE_TSO_ENERGY_AMOUNT = "CreateTSOEnergyAmount";
    public static final String UPDATE_TSO_ENERGY_AMOUNT = "UpdateTSOEnergyAmount";
    public static final String CREATE_DSO_ENERGY_AMOUNT = "CreateDSOEnergyAmount";
    public static final String UPDATE_DSO_ENERGY_AMOUNT = "UpdateDSOEnergyAmount";
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
            return Collections.emptyList();
        }
        log.info("Sauvegarde des energy amounts : {}", energyAmounts);
        if (InstanceEnum.DSO.equals(instance)) {
            writeEnergyAmountToBc(energyAmounts, CREATE_DSO_ENERGY_AMOUNT);
        } else {
            writeEnergyAmountToBc(energyAmounts, CREATE_TSO_ENERGY_AMOUNT);
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
            return Collections.emptyList();
        }
        log.info("Modification des energy amounts : {}", energyAmounts);
        if (InstanceEnum.DSO.equals(instance)) {
            writeEnergyAmountToBc(energyAmounts, UPDATE_DSO_ENERGY_AMOUNT);
        } else {
            writeEnergyAmountToBc(energyAmounts, UPDATE_TSO_ENERGY_AMOUNT);
        }
        return energyAmounts;
    }

    private List<EnergyAmount> writeEnergyAmountToBc(List<EnergyAmount> energyAmounts, String bcApiName) throws TechnicalException {
        for (EnergyAmount energyAmount : energyAmounts) {
            if (energyAmount != null) {
                try {
                    contract.submitTransaction(bcApiName, objectMapper.writeValueAsString(energyAmount));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de l'enregistrement de l'energy amount ", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
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
