package com.star.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.limitation.FichierOrdreLimitation;
import com.star.models.limitation.ImportOrdreLimitationResult;
import com.star.models.limitation.OrdreLimitation;
import com.star.models.limitation.OrdreLimitationCriteria;
import com.star.models.site.SiteResponse;
import com.star.repository.OrdreLimitationRepository;
import org.apache.commons.io.IOUtils;
import org.hyperledger.fabric.gateway.ContractException;
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
import java.util.List;

import static com.star.enums.InstanceEnum.DSO;
import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

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

    @Captor
    private ArgumentCaptor<List<OrdreLimitation>> ordreDebutLimitationArgumentCaptor;

    @MockBean
    private OrdreLimitationRepository ordreLimitationRepository;

    @Autowired
    private OrdreLimitationService ordreLimitationService;

    @Captor
    private ArgumentCaptor<String> queryCaptor;

    @Test
    void testImportOrdreDebutLimitationNull() {
        // GIVEN

        // WHEN
        IllegalArgumentException illegalArgumentException = Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(null, DSO));

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
        Assertions.assertThrows(IllegalArgumentException.class, () -> ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationWithoutExtension)), DSO));

        // THEN
    }

    @Test
    void testImportOrdreDebutLimitationSansDonnees() throws TechnicalException, IOException {
        // GIVEN
        String fileName = "ordre-debut-limitation-sans-donnees.json";

        // WHEN
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationWithoutData)), DSO);

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
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationDataKo)), DSO);

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
        ImportOrdreLimitationResult importOrdreLimitationResult = ordreLimitationService.importOrdreDebutLimitation(asList(createFichierOrdreLimitation(fileName, ordreDebutLimitationOk)), DSO);

        // THEN
        assertThat(importOrdreLimitationResult.getErrors()).isEmpty();
        Mockito.verify(ordreLimitationRepository, Mockito.times(1)).saveOrdreLimitations(ordreDebutLimitationArgumentCaptor.capture());
        assertThat(ordreDebutLimitationArgumentCaptor.getValue()).hasSize(1);
        OrdreLimitation ordreLimitation = ordreDebutLimitationArgumentCaptor.getValue().get(0);
        assertThat(ordreLimitation).extracting("originAutomationRegisteredResourceMrid", "registeredResourceMrid",
                        "measurementUnitName", "startCreatedDateTime", "messageType", "businessType", "reasonCode", "orderEnd")
                .containsExactly("ORIGIN_LNKINS_LKNZ", "PRM30001510803649", "MW", "2020-01-01T14:30:00", "message type", "business Type", "reason code", false);

    }

    private FichierOrdreLimitation createFichierOrdreLimitation(String fileName, Reader reader) throws IOException {
        FichierOrdreLimitation fichierOrdreLimitation = new FichierOrdreLimitation();
        fichierOrdreLimitation.setFileName(fileName);
        fichierOrdreLimitation.setInputStream(IOUtils.toInputStream(IOUtils.toString(reader), StandardCharsets.UTF_8));
        return fichierOrdreLimitation;
    }

    @Test
    void testFindLimitationOrders() throws JsonProcessingException, ContractException, TechnicalException {
        // GIVEN
        var ordreLimitationCriteria = OrdreLimitationCriteria.builder().activationDocumentMrid("val")
                .build();
        var ordreLimitation = OrdreLimitation.builder().activationDocumentMrid("val").build();
        byte[] result = objectMapper.writeValueAsBytes(ordreLimitation);
        Mockito.when(contract.evaluateTransaction(any(), any())).thenReturn(result);

        // WHEN
        var ordreLimitationResulte = ordreLimitationService.findLimitationOrders(ordreLimitationCriteria);

        // THEN
        verify(ordreLimitationRepository, Mockito.times(1)).findLimitationOrders(queryCaptor.capture());

        String queryValue = queryCaptor.getValue();
        assertThat(queryValue).contains("activationDocumentMrid");
    }
}
