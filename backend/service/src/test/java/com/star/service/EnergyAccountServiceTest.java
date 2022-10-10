package com.star.service;

import com.star.AbstractTest;
import com.star.exception.TechnicalException;
import com.star.models.energyaccount.EnergyAccountCriteria;
import com.star.models.energyaccount.EnergyAccountProducerCriteria;
import com.star.repository.EnergyAccountRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import static com.star.enums.DocTypeEnum.ENERGY_ACCOUNT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

class EnergyAccountServiceTest extends AbstractTest {

    @MockBean
    private EnergyAccountRepository energyAccountRepository;

    @Autowired
    private EnergyAccountService energyAccountService;

    @Captor
    private ArgumentCaptor<String> queryCaptor;

    @Captor
    private ArgumentCaptor<EnergyAccountProducerCriteria> energyAccountProducerCriteriaCaptor;

    @Test
    void testFindEnergyAccount() throws TechnicalException {
        // GIVEN
        EnergyAccountCriteria energyAccountCriteria = EnergyAccountCriteria.builder().
        endCreatedDateTime("endDate").meteringPointMrid("PRM-645").startCreatedDateTime("startDate").build();

        // WHEN
        energyAccountService.findEnergyAccount(energyAccountCriteria);

        // THEN
        verify(energyAccountRepository, Mockito.times(1)).findEnergyAccountByQuery(queryCaptor.capture());

        String queryValue = queryCaptor.getValue();
        assertThat(queryValue).contains("docType", ENERGY_ACCOUNT.getDocType(), "meteringPointMrid",
                "startCreatedDateTime", "endCreatedDateTime", energyAccountCriteria.getMeteringPointMrid(),
                energyAccountCriteria.getStartCreatedDateTime(), energyAccountCriteria.getEndCreatedDateTime());
    }
}