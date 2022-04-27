package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
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
    public static final String CREATE = "CreateEnergyAccount";

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
        log.info("Sauvegarde des energy accounts : {}", energyAccounts);
        for (EnergyAccount energyAccount : energyAccounts) {
            if (energyAccount != null) {
                try {
                    contract.submitTransaction(CREATE, objectMapper.writeValueAsString(energyAccount));
                } catch (TimeoutException | InterruptedException | JsonProcessingException exception) {
                    throw new TechnicalException("Erreur technique lors de création de l'ordre de limitation ", exception);
                } catch (ContractException contractException) {
                    throw new BusinessException(contractException.getMessage());
                }
            }
        }
        return energyAccounts;
    }

}
