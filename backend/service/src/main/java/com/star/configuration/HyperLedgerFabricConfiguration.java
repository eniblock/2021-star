package com.star.configuration;

import org.hyperledger.fabric.gateway.Contract;
import org.hyperledger.fabric.gateway.Gateway;
import org.hyperledger.fabric.gateway.Network;
import org.hyperledger.fabric.gateway.Wallet;
import org.hyperledger.fabric.gateway.Wallets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    @Value("${hyperledger-fabric.gateway.wallet}")
    private String wallet;

    @Value("${blockchain.api.contractdso}")
    private String contractdso;

    @Value("${blockchain.api.contracttso}")
    private String contracttso;

    @Value("${hyperledger-fabric.gateway.identityId}")
    private String identityId;


    @Bean
    public Network network() throws IOException {
        Network network = this.gateway().getNetwork(channel);
        return network;
    }

    @Bean(name = "dsoContract")
    public Contract dsoContract() throws IOException {
        return this.network().getContract(contractdso);
    }

    @Bean(name = "tsoContract")
    public Contract tsoContract() throws IOException {
        return this.network().getContract(contracttso);
    }

    @Bean
    public Wallet wallet() throws IOException {
        // Create a CA client for interacting with the CA.
        Path walletDirectory = Paths.get(wallet);
        return Wallets.newFileSystemWallet(walletDirectory);
    }

    @Bean
    public Gateway gateway() throws IOException {
        // Path to a common connection profile describing the network.
        Path networkConfigFile = Paths.get(networkConfig);

        // Configure the gateway connection used to access the network.
        Gateway.Builder builder = Gateway.createBuilder()
                .identity(this.wallet(), identityId)
                .networkConfig(networkConfigFile).discovery(true);
        return builder.connect();
    }
}