package com.star.service;

import com.cloudant.client.api.query.Expression;
import com.cloudant.client.api.query.Selector;
import com.star.AbstractTest;
import com.star.enums.InstanceEnum;
import com.star.exception.BusinessException;
import com.star.exception.TechnicalException;
import com.star.models.common.FichierImportation;
import com.star.models.energyamount.EnergyAmount;
import com.star.models.energyamount.EnergyAmountCriteria;
import com.star.models.energyamount.ImportEnergyAmountResult;
import com.star.repository.EnergyAmountRepository;
import com.star.service.helpers.QueryBuilderHelper;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
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

import static com.star.enums.DocTypeEnum.ENERGY_AMOUNT;
import static com.star.enums.InstanceEnum.DSO;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

class EnergyAmountServiceTest extends AbstractTest {

    private static final String systemOperatorMarketParticipantMrid = "17X100A100A0001A";

    @Value("classpath:/energyAmount/energy-amount-ok.json")
    private Reader energyAmountOk;

    @Value("classpath:/energyAmount/energy-amount-update-ok.json")
    private Reader energyAmountUpdateOk;

    @Value("classpath:/energyAmount/energy-amount-ko.json")
    private Reader energyAmountKo;

    @Value("classpath:/energyAmount/energy-amount-wrong-extension.txt")
    private Reader energyAmountWithWrongExtension;

    @Value("classpath:/energyAmount/energy-amount-unknown-registeredMrid.json")
    private Reader energyAmountWithUnknownRegisteredMrid;

    @Value("classpath:/energyAmount/energy-amount-wrong-senderMarketParticipantMrid.json")
    private Reader energyAmountWithWrongSenderMarketParticipantMrid;

    @Captor
    private ArgumentCaptor<List<EnergyAmount>> energyAmountsArgumentCaptor;

    @Captor
    private ArgumentCaptor<InstanceEnum> instanceArgumentCaptor;

    @Captor
    private ArgumentCaptor<String> queryCaptor;

    @MockBean
    private EnergyAmountRepository energyAmountRepository;

    @MockBean
    private SiteService siteService;

    @Autowired
    private EnergyAmountService energyAmountService;


    @Test
    void testImportEnergyAmountWithoutFile() {
        // GIVEN

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> energyAmountService.createEnergyAmounts(null,
                DSO, systemOperatorMarketParticipantMrid));

        // THEN
    }

    @Test
    void testImportEnergyAmountWithFileWithWrongExtension() {
        // GIVEN
        String fileName = "energy-amount-wrong-extension.txt";

        // WHEN
        Assertions.assertThrows(IllegalArgumentException.class, () -> energyAmountService.createEnergyAmounts(Arrays.asList(createFichierEnergyAmount(fileName, energyAmountWithWrongExtension)),
                DSO, systemOperatorMarketParticipantMrid));

        // THEN
    }

    @Test
    void testImportEnergyAmountWithFileWithBadData() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "energy-amount-ko.json";

        // WHEN
        ImportEnergyAmountResult importEnergyAmountResult = energyAmountService.createEnergyAmounts(Arrays.asList(createFichierEnergyAmount(fileName, energyAmountKo)),
                DSO, systemOperatorMarketParticipantMrid);

        // THEN
        Mockito.verifyNoInteractions(energyAmountRepository);
        assertThat(importEnergyAmountResult.getErrors()).isNotEmpty();
    }

    @Test
    void testImportEnergyAmountWithUnknownRegisteredResourceMrid() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "energy-amount-unknown-registeredMrid.json";
        Mockito.when(siteService.existSite(ArgumentMatchers.anyString())).thenReturn(false);
        // WHEN
        ImportEnergyAmountResult importEnergyAmountResult = energyAmountService.createEnergyAmounts(Arrays.asList(createFichierEnergyAmount(fileName, energyAmountWithUnknownRegisteredMrid)),
                DSO, systemOperatorMarketParticipantMrid);

        // THEN
        Mockito.verifyNoInteractions(energyAmountRepository);
        assertThat(importEnergyAmountResult.getErrors()).isNotEmpty();
    }

    @Test
    void testImportEnergyAmountWithWrongSenderMarketParticipantMrid() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "energy-amount-wrong-senderMarketParticipantMrid.json";
        Mockito.when(siteService.existSite(ArgumentMatchers.anyString())).thenReturn(true);
        // WHEN
        ImportEnergyAmountResult importEnergyAmountResult = energyAmountService.createEnergyAmounts(Arrays.asList(createFichierEnergyAmount(fileName, energyAmountWithWrongSenderMarketParticipantMrid)),
                DSO, systemOperatorMarketParticipantMrid);

        // THEN
        Mockito.verifyNoInteractions(energyAmountRepository);
        assertThat(importEnergyAmountResult.getErrors()).isNotEmpty();
    }

    @Test
    void testImportEnergyAmountOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "energy-amount-ok.json";
        Mockito.when(siteService.existSite(ArgumentMatchers.anyString())).thenReturn(true);
        // WHEN
        ImportEnergyAmountResult importEnergyAmountResult = energyAmountService.createEnergyAmounts(Arrays.asList(createFichierEnergyAmount(fileName, energyAmountOk)),
                DSO, systemOperatorMarketParticipantMrid);

        // THEN
        Mockito.verify(energyAmountRepository, Mockito.times(1)).save(energyAmountsArgumentCaptor.capture(), instanceArgumentCaptor.capture());
        assertThat(importEnergyAmountResult.getErrors()).isEmpty();
        assertThat(instanceArgumentCaptor.getValue()).isEqualTo(DSO);
        assertThat(energyAmountsArgumentCaptor.getValue()).hasSize(1);
    }


    @Test
    void testUpdateImportEnergyAmountOk() throws IOException, TechnicalException {
        // GIVEN
        String fileName = "energy-amount-update-ok.json";
        Mockito.when(siteService.existSite(ArgumentMatchers.anyString())).thenReturn(true);
        // WHEN
        ImportEnergyAmountResult importEnergyAmountResult = energyAmountService.updateEnergyAmounts(Arrays.asList(createFichierEnergyAmount(fileName, energyAmountUpdateOk)),
                DSO, systemOperatorMarketParticipantMrid);

        // THEN
        Mockito.verify(energyAmountRepository, Mockito.times(1)).update(energyAmountsArgumentCaptor.capture(), instanceArgumentCaptor.capture());
        assertThat(importEnergyAmountResult.getErrors()).isEmpty();
        assertThat(instanceArgumentCaptor.getValue()).isEqualTo(DSO);
        assertThat(energyAmountsArgumentCaptor.getValue()).hasSize(1);
    }

    @Test
    void testFindEnergyAmount() throws TechnicalException {
        // GIVEN
        EnergyAmountCriteria energyAmountCriteria = EnergyAmountCriteria.builder().energyAmountMarketDocumentMrid("78sdr651").build();

        // WHEN
        energyAmountService.findEnergyAmount(energyAmountCriteria);

        // THEN
        verify(energyAmountRepository, Mockito.times(1)).findEnergyAmountByQuery(queryCaptor.capture());

        String queryValue = queryCaptor.getValue();
        assertThat(queryValue).contains("energyAmountMarketDocumentMrid", ENERGY_AMOUNT.getDocType());
    }

    private FichierImportation createFichierEnergyAmount(String fileName, Reader reader) throws IOException {
        FichierImportation fichierOrdreLimitation = new FichierImportation();
        fichierOrdreLimitation.setFileName(fileName);
        fichierOrdreLimitation.setInputStream(IOUtils.toInputStream(IOUtils.toString(reader), StandardCharsets.UTF_8));
        return fichierOrdreLimitation;
    }

}