package com.star.repository;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.reservebid.ReserveBid;
import com.star.models.reservebid.ReserveBidMarketDocumentCreation;
import org.hyperledger.fabric.gateway.ContractException;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class ReserveBidRepositoryTest extends AbstractTest {
    @Autowired
    private ReserveBidRepository reserveBidRepository;

    @Captor
    private ArgumentCaptor<String> functionNameArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> objectArgumentCaptor;

    @Test
    void testSaveNullReserveBid() throws TechnicalException {
        // GIVEN

        // WHEN
        reserveBidRepository.save(null);

        // THEN
        verifyNoInteractions(contract);
    }

    @Test
    void testSaveReserveBid() throws TechnicalException, InterruptedException, TimeoutException, ContractException {
        // GIVEN
        Float energyPriceAmount = Float.parseFloat("35.15");
        ReserveBid reserveBid = ReserveBid.builder().meteringPointMrid("3516846511600").messageType("TEST162JB")
                .processType("P31616").senderMarketParticipantMrid("M12JHBHB779").receiverMarketParticipantMrid("R12NJKJNBUB989")
                .createdDateTime("2022-12-05 12:12:56").priceMeasureUnitName("MW").currencyUnitName("CLIDOIN").energyPriceAmount(energyPriceAmount).build();
        ReserveBidMarketDocumentCreation reserveBidMarketDocumentCreation = new ReserveBidMarketDocumentCreation();
        reserveBidMarketDocumentCreation.setReserveBid(reserveBid);
        reserveBidMarketDocumentCreation.setAttachmentFileList(new ArrayList<>());

        // WHEN
        reserveBidRepository.save(reserveBidMarketDocumentCreation);

        // THEN
        Mockito.verify(contract, Mockito.times(1)).submitTransaction(functionNameArgumentCaptor.capture(), objectArgumentCaptor.capture());
        assertThat(functionNameArgumentCaptor.getValue()).isEqualTo(reserveBidRepository.CREATE_RESERVE_BID_MARKET_DOCUMENT);
        assertThat(objectArgumentCaptor.getValue()).isNotNull();
    }

}
