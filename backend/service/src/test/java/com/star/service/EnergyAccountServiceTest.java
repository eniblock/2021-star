package com.star.service;

import com.star.AbstractTest;
import com.star.repository.EnergyAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

class EnergyAccountServiceTest extends AbstractTest {

    @MockBean
    private EnergyAccountRepository energyAccountRepository;

    @Autowired
    private EnergyAccountService energyAccountService;

}