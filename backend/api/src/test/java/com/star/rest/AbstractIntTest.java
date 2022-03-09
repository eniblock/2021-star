package com.star.rest;

import com.star.StarApplication;
import com.star.configuration.TestApiConfiguration;
import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.gateway.Wallet;
import org.junit.Ignore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@Ignore("Base class for test.")
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, classes = StarApplication.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(locations = "classpath:application-test.yml")
@ContextConfiguration(classes = {TestApiConfiguration.class})
public abstract class AbstractIntTest {
    @Autowired
    protected MockMvc mockMvc;

    @MockBean
    protected Network network;

    @MockBean
    protected Gateway gateway;

    @MockBean
    protected Contract contract;

    @MockBean
    protected Wallet wallet;
}