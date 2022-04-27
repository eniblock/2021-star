package com.star;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.star.configuration.TestConfiguration;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.gateway.Wallet;
import org.junit.Ignore;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Ignore("Base class for Service test.")
@ContextConfiguration(classes = {TestConfiguration.class})
@ActiveProfiles("test")
@SpringBootTest
public class AbstractTest {
    @MockBean
    protected Network network;

    @MockBean
    protected Gateway gateway;

    @MockBean
    protected Contract contract;

    @MockBean
    protected Wallet wallet;

}