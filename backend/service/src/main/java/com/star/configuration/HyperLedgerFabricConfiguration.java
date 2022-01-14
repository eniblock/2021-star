package com.star.configuration;

import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Identities;
import org.hyperledger.fabric.gateway.Identity;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;
import org.hyperledger.fabric.sdk.Enrollment;
import org.hyperledger.fabric.sdk.exception.CryptoException;
import org.hyperledger.fabric.sdk.security.CryptoSuite;
import org.hyperledger.fabric.sdk.security.CryptoSuiteFactory;
import org.hyperledger.fabric_ca.sdk.EnrollmentRequest;
import org.hyperledger.fabric_ca.sdk.HFCAClient;
import org.hyperledger.fabric_ca.sdk.exception.EnrollmentException;
import org.hyperledger.fabric_ca.sdk.exception.InvalidArgumentException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.cert.CertificateException;
import java.util.Properties;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
@Configuration
public class HyperLedgerFabricConfiguration {
    @Value("${blockchain.api.networkName}")
    private String channel;

    @Value("${hyperledger-fabric.gateway.networkConfig}")
    private String networkConfig;

    @Value("${blockchain.api.contractdso}")
    private String contractdso;

    @Value("${blockchain.api.contracttso}")
    private String contracttso;

    @Value("${hyperledger-fabric.gateway.identityId}")
    private String identityId;

    @Value("${hyperledger-fabric.gateway.password}")
    private String password;

    @Value("${hyperledger-fabric.ca-client.url}")
    private String clientUrl;

    @Value("${hyperledger-fabric.ca-client.allowAllHostNames}")
    private boolean allowAllHostNames;

    @Value("${hyperledger-fabric.ca-client.pemFile}")
    private String pemFile;

    @Bean
    public Network network() throws IOException, CertificateException, EnrollmentException, InvalidArgumentException, NoSuchMethodException, org.hyperledger.fabric.sdk.exception.InvalidArgumentException, InstantiationException, CryptoException, IllegalAccessException, InvocationTargetException, ClassNotFoundException {
        Network network = this.gateway().getNetwork(channel);
        return network;
    }

    @Bean
    public Gateway gateway() throws IOException, IllegalAccessException, CertificateException, InstantiationException, InvocationTargetException, NoSuchMethodException, InvalidArgumentException, org.hyperledger.fabric.sdk.exception.InvalidArgumentException, EnrollmentException, CryptoException, ClassNotFoundException {
        // load a CCP
        Path networkConfigPath = Paths.get(networkConfig);
        Gateway.Builder builder = Gateway.createBuilder();
        builder.identity(this.wallet(), identityId).networkConfig(networkConfigPath).discovery(true);
        return builder.connect();
    }

    @Bean(name = "dsoContract")
    public Contract dsoContract() throws IOException, CertificateException, EnrollmentException, InvalidArgumentException, NoSuchMethodException, InvocationTargetException, org.hyperledger.fabric.sdk.exception.InvalidArgumentException, InstantiationException, IllegalAccessException, CryptoException, ClassNotFoundException {
        return this.network().getContract(contractdso);
    }


    @Bean(name = "tsoContract")
    public Contract tsoContract() throws IOException, CertificateException, EnrollmentException, InvalidArgumentException, NoSuchMethodException, InvocationTargetException, org.hyperledger.fabric.sdk.exception.InvalidArgumentException, InstantiationException, IllegalAccessException, CryptoException, ClassNotFoundException {
        return this.network().getContract(contracttso);
    }

    @Bean
    public Wallet wallet() throws IOException, EnrollmentException, InvalidArgumentException, CertificateException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException, CryptoException, org.hyperledger.fabric.sdk.exception.InvalidArgumentException {
        // Create a CA client for interacting with the CA.
        Properties props = new Properties();
        props.put("pemFile", pemFile);
        props.put("allowAllHostNames", allowAllHostNames);
        HFCAClient caClient = HFCAClient.createNewInstance(clientUrl, props);
        CryptoSuite cryptoSuite = CryptoSuiteFactory.getDefault().getCryptoSuite();
        caClient.setCryptoSuite(cryptoSuite);

        // Create a wallet for managing identities
        Wallet wallet = Wallets.newFileSystemWallet(Paths.get("wallet"));

        // Check to see if we've already enrolled the admin user.
        if (wallet.get(identityId) != null) {
            System.out.println("An identity for the admin user \"admin\" already exists in the wallet");
        }

        // Enroll the admin user, and import the new identity into the wallet.
        final EnrollmentRequest enrollmentRequestTLS = new EnrollmentRequest();
        enrollmentRequestTLS.addHost("localhost");
        enrollmentRequestTLS.setProfile("tls");
        Enrollment enrollment = caClient.enroll(identityId, password, enrollmentRequestTLS);
        Identity user = Identities.newX509Identity("Org1MSP", enrollment);
        wallet.put(identityId, user);
        return wallet;
    }
}