package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.limitation.ImportOrdreLimitationResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationCriteria;
import com.star.models.limitation.OrdreLimitationEligibilityStatus;
import com.star.repository.OrdreLimitationRepository;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.star.enums.InstanceEnum.DSO;
import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
class OrdreLimitationServiceTest extends AbstractTest {

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-ok.json")
    private Reader ordreDebutLimitationOk;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-sans-extension")
    private Reader ordreDebutLimitationWithoutExtension;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-sans-donnees.json")
    private Reader ordreDebutLimitationWithoutData;

    @Value("classpath:/ordreLimitation/ordre-debut-limitation-donnees-ko.json")
    private Reader ordreDebutLimitationDataKo;


    @Value("classpath:/ordreLimitation/ordre-debut-fin-limitation-ok.json")
    private Reader ordreDebutFinLimitationOk;

    @Value("classpath:/ordreLimitation/ordre-debut-fin-limitation-sans-extension")
    private Reader ordreDebutFinLimitationWithoutExtension;

    @Value("classpath:/ordreLimitation/ordre-debut-fin-limitation-sans-donnees.json")
    private Reader ordreDebutFinLimitationWithoutData;

    @Value("classpath:/ordreLimitation/ordre-debut-fin-limitation-donnees-ko.json")
    private Reader ordreDebutFinLimitationDataKo;

    @Value("classpath:/ordreLimitation/ordre-fin-limitation-ok.json")
    private Reader ordreFinLimitationOk;

    @Value("classpath:/ordreLimitation/ordre-fin-limitation-ok-test-eligibilityStatus.json")
    private Reader ordreFinLimitationEligibilityStatusKo;

    @Captor
    private ArgumentCaptor<List<OrdreLimitation>> ordreDebutLimitationArgumentCaptor;

    @Captor
    private ArgumentCaptor<List<OrdreLimitation>> ordreDebutFinLimitationArgumentCaptor;

    @Captor
    private ArgumentCaptor<List<OrdreLimitation>> ordreFinLimitationArgumentCaptor;

    @MockBean
    private OrdreLimitationRepository ordreLimitationRepository;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Captor
    private ArgumentCaptor<String> queryCaptor;

    @Captor
    private ArgumentCaptor<OrdreLimitationEligibilityStatus> ordreLimitationEligibilityStatusCaptor;

    @Test
    void testImportOrdreDebutLimitationNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(null, DSO));

        // THEN
    }

    @Test
    void testImportOrdreDebutLimitationVide() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(new ArrayList<>(), DSO));

        // THEN
    }

    @Test
    void testImportOrdreDebutLimitationSansExtension() {
        // GIVEN
        String fileName = "ordre-debut-limitation-sans-extension";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdre(fileName, ordreDebutLimitationWithoutExtension)), DSO));

        // THEN
    }

    @Test
    void testImportOrdreDebutLimitationSansDonnees() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "ordre-debut-limitation-sans-donnees.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdre(fileName, ordreDebutLimitationWithoutData)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).hasSize(1);
        assertThat(importOrdreLimitationResult.getDatas()).isEmpty();
        verifyNoInteractions(ordreLimitationRepository);
    }


    @Test
    void testImportOrdreDebutLimitationAvecDonneesKo() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "ordre-debut-limitation-donnees-ko.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdre(fileName, ordreDebutLimitationDataKo)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).isNotEmpty();
        assertThat(importOrdreLimitationResult.getDatas()).isEmpty();
        verifyNoInteractions(ordreLimitationRepository);
    }

    @Test
    void testImportOrdreDebutLimitationOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "ordre-debut-limitation-ok.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdre(fileName, ordreDebutLimitationOk)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).isEmpty();
        Mockito.verify(ordreLimitationRepository, Mockito.times(1)).saveOrdreLimitations(ordreDebutLimitationArgumentCaptor.capture());
        assertThat(ordreDebutLimitationArgumentCaptor.getValue()).hasSize(1);
        OrdreLimitation ordreLimitation = ordreDebutLimitationArgumentCaptor.getValue().get(0);
        assertThat(ordreLimitation).extracting("originAutomationRegisteredResourceMrid", "registeredResourceMrid",
                "measurementUnitName", "startCreatedDateTime", "messageType", "businessType", "reasonCode", "orderEnd")
                .containsExactly("ORIGIN_LNKINS_LKNZ", "PRM30001510803649", "MW", "2020-01-01T14:30:00Z", "message type", "business Type", "reason code", false);

    }

    @Test
    void testImportCoupleOrdreDebutFinNull() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importCoupleOrdreDebutFin(null, DSO));

        // THEN
    }

    @Test
    void testImportCoupleOrdreDebutFinVide() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importCoupleOrdreDebutFin(new ArrayList<>(), DSO));

        // THEN
    }

    @Test
    void testImportCoupleOrdreDebutFinSansExtension() {
        // GIVEN
        String fileName = "ordre-debut-fin-limitation-sans-extension";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importCoupleOrdreDebutFin(asList(createFichierOrdre(fileName, ordreDebutFinLimitationWithoutExtension)), DSO));

        // THEN
    }

    @Test
    void testImportCoupleOrdreDebutFinSansDonnees() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "ordre-debut-fin-limitation-sans-donnees.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importCoupleOrdreDebutFin(asList(createFichierOrdre(fileName, ordreDebutFinLimitationWithoutData)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).hasSize(1);
        assertThat(importOrdreLimitationResult.getDatas()).isEmpty();
        verifyNoInteractions(ordreLimitationRepository);
    }


    @Test
    void testImportOrdreDebutFinLimitationAvecDonneesKo() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "ordre-debut-fin-limitation-donnees-ko.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importCoupleOrdreDebutFin(asList(createFichierOrdre(fileName, ordreDebutFinLimitationDataKo)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).isNotEmpty();
        assertThat(importOrdreLimitationResult.getDatas()).isEmpty();
        verifyNoInteractions(ordreLimitationRepository);
    }

    @Test
    void testImportOrdreDebutFinLimitationOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "ordre-debut-fin-limitation-ok.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importCoupleOrdreDebutFin(asList(createFichierOrdre(fileName, ordreDebutFinLimitationOk)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).isEmpty();
        Mockito.verify(ordreLimitationRepository, Mockito.times(1)).saveOrdreLimitations(ordreDebutFinLimitationArgumentCaptor.capture());
        assertThat(ordreDebutFinLimitationArgumentCaptor.getValue()).hasSize(1);
        OrdreLimitation ordreLimitation = ordreDebutFinLimitationArgumentCaptor.getValue().get(0);
        assertThat(ordreLimitation).extracting("originAutomationRegisteredResourceMrid", "registeredResourceMrid",
                "measurementUnitName", "startCreatedDateTime", "endCreatedDateTime", "messageType", "businessType", "reasonCode", "orderEnd")
                .containsExactly("ORIGIN_LNKINS_LKNZ", "PRM30001510803649", "MW", "2020-01-01T14:30:00Z", "2020-01-01T14:40:00Z", "message type", "business Type", "reason code", false);

    }

    private FichierImportation createFichierOrdre(String fileName, Reader reader) throws IOException {
        FichierImportation fichierOrdreLimitation = new FichierImportation();
        fichierOrdreLimitation.setFileName(fileName);
        fichierOrdreLimitation.setInputStream(IOUtils.toInputStream(IOUtils.toString(reader), StandardCharsets.UTF_8));
        return fichierOrdreLimitation;
    }

    @Test
    void testGetOrdreDebutLimitation() throws TechnicalException {
        // GIVEN

        // WHEN
        ordreLimitationService.getOrdreDebutLimitation(DSO);

        // THEN
        verify(ordreLimitationRepository, Mockito.times(1)).findOrderByQuery(queryCaptor.capture());

        String queryValue = queryCaptor.getValue();
        assertThat(queryValue).contains("instance", "docType", "endCreatedDateTime", "orderEnd");
    }

    @Test
    void testImportimportOrdreFinLimitationOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "ordre-fin-limitation-ok.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importOrdreFinLimitation(asList(createFichierOrdre(fileName, ordreFinLimitationOk)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).isEmpty();
        Mockito.verify(ordreLimitationRepository, Mockito.times(1)).saveOrdreLimitations(ordreFinLimitationArgumentCaptor.capture());
        assertThat(ordreFinLimitationArgumentCaptor.getValue()).hasSize(1);
    }

    @Test
    void testImportimportOrdreFinLimitationEligibilityStatusKo() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "ordre-fin-limitation-ok-test-eligibilityStatus.json";

        // WHEN
        ordreLimitationService.importOrdreFinLimitation(asList(createFichierOrdre(fileName, ordreFinLimitationEligibilityStatusKo)), DSO);


        // THEN
        Mockito.verifyNoInteractions(ordreLimitationRepository);
    }

    @Test
    void testFindLimitationOrders() throws TechnicalException {
        // GIVEN
        var ordreLimitationCriteria = OrdreLimitationCriteria.builder().activationDocumentMrid("val")
                .build();

        // WHEN
        ordreLimitationService.findLimitationOrders(ordreLimitationCriteria);

        // THEN
        verify(ordreLimitationRepository, Mockito.times(1)).findLimitationOrders(queryCaptor.capture());

        String queryValue = queryCaptor.getValue();
        assertThat(queryValue).contains("activationDocumentMrid");
    }

    @Test
    void testOrdreDebutEligibilityStatusWithNullValue() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.ordreDebutEligibilityStatus(null));

        // THEN
        verifyNoMoreInteractions(ordreLimitationRepository);
    }


    @Test
    void testOrdreDebutEligibilityStatus() throws TechnicalException {
        // GIVEN
        OrdreLimitationEligibilityStatus ordreLimitationEligibilityStatus = OrdreLimitationEligibilityStatus.builder()
                .eligibilityStatus("OUI").activationDocumentMrid("PRM-516-516").build();
        when(ordreLimitationRepository.findLimitationOrders(any())).thenReturn(Arrays.asList(OrdreLimitation.builder().build()));

        // WHEN
        ordreLimitationService.ordreDebutEligibilityStatus(ordreLimitationEligibilityStatus);

        // THEN
        verify(ordreLimitationRepository, Mockito.times(1)).updateOrdreDebutEligibilityStatus(ordreLimitationEligibilityStatusCaptor.capture());
        verify(ordreLimitationRepository, Mockito.times(1)).findLimitationOrders(queryCaptor.capture());
    }

}
