package com.star.repository;

import com.star.AbstractTest;
import com.star.enums.InstanceEnum;
import com.star.exception.TechnicalException;
import com.star.models.energyamount.EnergyAmount;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class EnergyAmountRepositoryTest extends AbstractTest {
    @Autowired
    private EnergyAmountRepository energyAmountRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> queryArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveEmptyEnergyAmountList() throws TechnicalException {
        // GIVEN

        // WHEN
        energyAmountRepository.save(new ArrayList<>(), InstanceEnum.DSO);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveEnergyAmountDso() throws InterruptedException, TimeoutException, ContractException, TechnicalException {
        // GIVEN

        // WHEN
        energyAmountRepository.save(Arrays.asList(getEnergyAmount()), InstanceEnum.DSO);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAmountRepository.CREATE_DSO_ENERGY_AMOUNT_LIST);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
    }

    @Test
    void testSaveEnergyAmountTso() throws InterruptedException, TimeoutException, ContractException, TechnicalException {
        // GIVEN

        // WHEN
        energyAmountRepository.save(Arrays.asList(getEnergyAmount()), InstanceEnum.TSO);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAmountRepository.CREATE_TSO_ENERGY_AMOUNT_LIST);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
    }

    @Test
    void testUpdateEnergyAmountDso() throws InterruptedException, TimeoutException, ContractException, TechnicalException {
        // GIVEN

        // WHEN
        energyAmountRepository.update(Arrays.asList(getEnergyAmount()), InstanceEnum.DSO);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAmountRepository.UPDATE_DSO_ENERGY_AMOUNT_LIST);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
    }

    @Test
    void testSaveEmptyEnergyAmountTso() throws InterruptedException, TimeoutException, ContractException, TechnicalException {
        // GIVEN

        // WHEN
        energyAmountRepository.update(Arrays.asList(getEnergyAmount()), InstanceEnum.TSO);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAmountRepository.UPDATE_TSO_ENERGY_AMOUNT_LIST);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
    }


    @Test
    void testFindEnergyAmount() throws ContractException, TechnicalException {
        // GIVEN
        String query = "query";
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(null);

        // WHEN
        energyAmountRepository.findEnergyAmountByQuery("query");

        // THEN
        Mockito.verify(contract, Mockito.times(1)).evaluateTransaction(functionNameArgumentCaptor.capture(), queryArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(energyAmountRepository.GET_ENERGY_AMOUNT_WITH_PAGINATION);
        assertThat(queryArgumentCaptor.getValue()).isEqualTo(query);
    }


    private EnergyAmount getEnergyAmount() {
        return EnergyAmount.builder().activationDocumentMrid("AHKJGI87Y-KH2IIg-KJHUIHIU").quantity("12").measurementUnitName("MW")
                .areaDomain("AREA-DOMAIN").senderMarketParticipantMrid("PRM561656").senderMarketParticipantRole("ROLE").receiverMarketParticipantMrid("PRMJHGTFTU")
                .receiverMarketParticipantRole("RECEIVER_ROLE").createdDateTime("2022-09-12 14:18:14").timeInterval("00:00:00").build();
    }
}
