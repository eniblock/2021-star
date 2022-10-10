package com.star.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.energyaccount.EnergyAccount;
import com.star.models.energyaccount.EnergyAccountProducerCriteria;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class EnergyAccountRepositoryTest extends AbstractTest {
    @Autowired
    private EnergyAccountRepository energyAccountRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> queryArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveEmptyEnergyAccountList() throws TechnicalException {
        // GIVEN

        // WHEN
        energyAccountRepository.save(new ArrayList<>());

        // THEN
        verifyNoInteractions(contract);
    }


    @Test
    void testUpdateeEmptyEnergyAccountList() throws TechnicalException {
        // GIVEN

        // WHEN
        energyAccountRepository.update(new ArrayList<>());

        // THEN
        verifyNoInteractions(contract);
    }


    @Test
    void testSaveAccountount() throws InterruptedException, TimeoutException, ContractException, TechnicalException, JsonProcessingException {
        // GIVEN
        List<EnergyAccount> energyAccounts = Arrays.asList(getEnergyAccount());
        // WHEN
        energyAccountRepository.save(energyAccounts);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAccountRepository.CREATE_LIST);
        assertThat(objectArgumentCaptor.getValue()).isEqualTo(objectMapper.writeValueAsString(energyAccounts));
    }

    @Test
    void testUpdateEnergyAccounts() throws InterruptedException, TimeoutException, ContractException, TechnicalException, JsonProcessingException {
        // GIVEN
        List<EnergyAccount> energyAccounts = Arrays.asList(getEnergyAccount());

        // WHEN
        energyAccountRepository.update(energyAccounts);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAccountRepository.UPDATE_LIST);
        assertThat(objectArgumentCaptor.getValue()).isEqualTo(objectMapper.writeValueAsString(energyAccounts));
    }


    @Test
    void testFindEnergyAccountByQuery() throws ContractException, TechnicalException {
        // GIVEN
        String query = "query";
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(null);

        // WHEN
        energyAccountRepository.findEnergyAccountByQuery("query");

        // THEN
        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture(), queryArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAccountRepository.GET_ENERGY_ACCOUNT_WITH_PAGINATION);
        assertThat(queryArgumentCaptor.getValue()).isEqualTo(query);
    }

    private EnergyAccount getEnergyAccount() {
        return EnergyAccount.builder().energyAccountMarketDocumentMrid("13789-KH2IIg-KJIU").meteringPointMrid("PRM24521").measurementUnitName("MW")
                .areaDomain("AREA-DOMAIN").senderMarketParticipantMrid("PRM561656").senderMarketParticipantRole("ROLE").receiverMarketParticipantMrid("PRMJHGTFTU")
                .receiverMarketParticipantRole("RECEIVER_ROLE").createdDateTime("2022-09-12 14:18:14").timeInterval("00:00:00").build();

    }
}
