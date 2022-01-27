#!/bin/bash

set -ex

docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf/testing:/hlf/testing hyperledger/fabric-tools:2.3  cryptogen generate --config=/hlf/testing/crypto-config.yaml --output=/hlf/testing/generated/crypto-config
docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf/testing:/hlf/testing hyperledger/fabric-tools:2.3 env FABRIC_CFG_PATH=/hlf/testing configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock /hlf/testing/generated/genesis.block
docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf/testing:/hlf/testing hyperledger/fabric-tools:2.3 env FABRIC_CFG_PATH=/hlf/testing configtxgen -profile TwoOrgsChannel -outputCreateChannelTx /hlf/testing/generated/star.tx -channelID star

function generate_secrets {
    # orderer
    echo ---
    kubectl create  --dry-run=client -o yaml namespace orderer-testing
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--genesis --from-file=./hlf/testing/generated/genesis.block
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--ord-admincert --from-file=cert.pem=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/users/Admin@orderer/msp/signcerts/Admin@orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer1-idcert --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/msp/signcerts/orderer1.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer1-idkey --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer1-cacert --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/msp/cacerts/ca.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing tls hlf--orderer1-tls --key=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/server.key --cert=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer1-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer2-idcert --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/msp/signcerts/orderer2.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer2-idkey --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer2-cacert --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/msp/cacerts/ca.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing tls hlf--orderer2-tls --key=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/tls/server.key --cert=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer2-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer3-idcert --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/msp/signcerts/orderer3.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer3-idkey --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer3-cacert --from-file=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/msp/cacerts/ca.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing tls hlf--orderer3-tls --key=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/tls/server.key --cert=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-testing generic hlf--orderer3-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/tls/ca.crt

    # enedis
    echo ---
    kubectl create  --dry-run=client -o yaml namespace enedis-testing
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic starchannel --from-file=./hlf/testing/generated/star.tx
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--peer1-idcert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/msp/signcerts/peer1.enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--peer1-idkey --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--peer1-cacert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/msp/cacerts/ca.enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing tls hlf--peer1-tls --key=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/tls/server.key --cert=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--peer1-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing tls hlf--peer1-tls-client --key=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/client.key --cert=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--peer1-client-tlsrootcert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--peer1-admincert --from-file=cert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/msp/signcerts/Admin@enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-testing generic hlf--peer1-adminkey --from-file=cert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/msp/keystore/priv_sk

    # rte
    echo ---
    kubectl create  --dry-run=client -o yaml namespace rte-testing
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic starchannel --from-file=./hlf/testing/generated/star.tx
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--peer1-idcert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/msp/signcerts/peer1.rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--peer1-idkey --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--peer1-cacert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/msp/cacerts/ca.rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing tls hlf--peer1-tls --key=./hlf/testing/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/server.key --cert=./hlf/testing/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--peer1-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing tls hlf--peer1-tls-client --key=./hlf/testing/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/client.key --cert=./hlf/testing/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--peer1-client-tlsrootcert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--peer1-admincert --from-file=cert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/msp/signcerts/Admin@rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-testing generic hlf--peer1-adminkey --from-file=cert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/msp/keystore/priv_sk

    # producer
    echo ---
    kubectl create  --dry-run=client -o yaml namespace producer-testing
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic starchannel --from-file=./hlf/testing/generated/star.tx
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--peer1-idcert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/msp/signcerts/peer1.producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--peer1-idkey --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--peer1-cacert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/msp/cacerts/ca.producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing tls hlf--peer1-tls --key=./hlf/testing/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/tls/server.key --cert=./hlf/testing/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--peer1-tlsrootcert --from-file=cacert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing tls hlf--peer1-tls-client --key=./hlf/testing/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/client.key --cert=./hlf/testing/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--peer1-client-tlsrootcert --from-file=./hlf/testing/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--peer1-admincert --from-file=cert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/msp/signcerts/Admin@producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-testing generic hlf--peer1-adminkey --from-file=cert.pem=./hlf/testing/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/msp/keystore/priv_sk
}

generate_secrets > secrets-testing.yaml
