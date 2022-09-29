package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.reservebid.ImportReserveBidResult;
import com.star.models.reservebid.ReserveBid;
import com.star.models.reservebid.ReserveBidMarketDocumentCreation;
import com.star.repository.ReserveBidRepository;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class ReserveBidServiceTest extends AbstractTest {
    @Value("classpath:/reserveBid/file-test.pdf")
    private Reader fileTestPdf;

    @Value("classpath:/reserveBid/file-test-without-extension")
    private Reader fileTestWithoutExtension;

    @Value("classpath:/reserveBid/file-test-wrong-extension.json")
    private Reader fileTestWrongExtension;

    @MockBean
    private ReserveBidRepository reserveBidRepository;

    @Autowired
    private ReserveBidService reserveBidService;

    @Captor
    private ArgumentCaptor<ReserveBidMarketDocumentCreation> reserveBidMarketDocumentCreationArgumentCaptor;


    @Test
    void testCreateReserveBidNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> reserveBidService.createReserveBid(null, null));

        // THEN
    }

    @Test
    void testCreateReserveBidWitFileWithWrongExtension() {
        // GIVEN
        String fileName = "file-test-wrong-extension.json";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> reserveBidService.createReserveBid(new ReserveBid(), asList(createFichierOrdre(fileName, fileTestWithoutExtension))));

        // THEN
    }

    @Test
    void testCreateReserveBidWithFileWithoutExtension() {
        // GIVEN
        String fileName = "file-test-without-extension";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> reserveBidService.createReserveBid(new ReserveBid(), asList(createFichierOrdre(fileName, fileTestWrongExtension))));

        // THEN
    }

    @Test
    void testCreateReserveBidWithoutMandatoryAttribute() throws TechnicalException, IOException {
        // GIVEN
        ReserveBid reserveBidWithoutEnergyPriceAmount = ReserveBid.builder().meteringPointMrid("3516846511600").messageType("messageType")
                .processType("processType").senderMarketParticipantMrid("M12JHBHB779").receiverMarketParticipantMrid("R12NJKJNBUB989")
                .createdDateTime("2022-12-05 12:12:56").priceMeasureUnitName("145€").currencyUnitName("45W").build();

        // WHEN
        ImportReserveBidResult importReserveBidResult = reserveBidService.createReserveBid(reserveBidWithoutEnergyPriceAmount, null);

        // THEN
        assertThat(importReserveBidResult.getErrors()).hasSize(1);
        String error = importReserveBidResult.getErrors().get(0);
        assertThat(error).contains("energyPriceAmount");
        assertThat(importReserveBidResult.getReserveBid()).isNull();
        Mockito.verifyNoInteractions(reserveBidRepository);
    }

    @Test
    void testCreateReserveBidOk() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "file-test.pdf";
        Float energyPriceAmount = Float.parseFloat("35.15");
        ReserveBid reserveBid = ReserveBid.builder().meteringPointMrid("3516846511600").messageType("TEST162JB")
                .processType("P31616").senderMarketParticipantMrid("M12JHBHB779").receiverMarketParticipantMrid("R12NJKJNBUB989")
                .createdDateTime("2022-12-05 12:12:56").priceMeasureUnitName("MW").currencyUnitName("CLIDOIN").energyPriceAmount(energyPriceAmount).build();

        // WHEN
        ImportReserveBidResult importReserveBidResult = reserveBidService.createReserveBid(reserveBid, asList(createFichierOrdre(fileName, fileTestPdf)));

        // THEN
        assertThat(importReserveBidResult.getErrors()).isEmpty();
        Mockito.verify(reserveBidRepository, Mockito.times(1)).save(reserveBidMarketDocumentCreationArgumentCaptor.capture());

        ReserveBid reserveBidResult = reserveBidMarketDocumentCreationArgumentCaptor.getValue().getReserveBid();
        assertThat(reserveBidResult).extracting("meteringPointMrid", "messageType",
                "processType", "senderMarketParticipantMrid", "receiverMarketParticipantMrid", "createdDateTime",
                "priceMeasureUnitName", "currencyUnitName", "energyPriceAmount")
                .containsExactly("3516846511600", "TEST162JB", "P31616", "M12JHBHB779", "R12NJKJNBUB989", "2022-12-05 12:12:56", "MW",
                        "CLIDOIN", energyPriceAmount);
        assertThat(reserveBidResult.getAttachments()).hasSize(1);
    }

    private FichierImportation createFichierOrdre(String fileName, Reader reader) throws IOException {
        FichierImportation fichierImportation = new FichierImportation();
        fichierImportation.setFileName(fileName);
        fichierImportation.setInputStream(IOUtils.toInputStream(IOUtils.toString(reader), StandardCharsets.UTF_8));
        return fichierImportation;
    }
}
