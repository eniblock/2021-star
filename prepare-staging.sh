#!/bin/bash

set -ex

docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf/staging:/hlf/staging hyperledger/fabric-tools:2.3  cryptogen generate --config=/hlf/staging/crypto-config.yaml --output=/hlf/staging/generated/crypto-config
docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf/staging:/hlf/staging hyperledger/fabric-tools:2.3 env FABRIC_CFG_PATH=/hlf/staging configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock /hlf/staging/generated/genesis.block
docker run --rm -u $(id -u):$(id -g) -v $PWD/hlf/staging:/hlf/staging hyperledger/fabric-tools:2.3 env FABRIC_CFG_PATH=/hlf/staging configtxgen -profile TwoOrgsChannel -outputCreateChannelTx /hlf/staging/generated/star.tx -channelID star

./hlf/staging/ccp-generate.sh enedis
./hlf/staging/ccp-generate.sh producer
./hlf/staging/ccp-generate.sh rte

./hlf/staging/user-generate.sh enedis
./hlf/staging/user-generate.sh producer
./hlf/staging/user-generate.sh rte

function generate_secrets {
    # orderer
    echo ---
    kubectl create  --dry-run=client -o yaml namespace orderer-staging
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--genesis --from-file=./hlf/staging/generated/genesis.block
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--ord-admincert --from-file=cert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/users/Admin@orderer/msp/signcerts/Admin@orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer1-idcert --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/msp/signcerts/orderer1.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer1-idkey --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer1-cacert --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/msp/cacerts/ca.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging tls hlf--orderer1-tls --key=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/server.key --cert=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer1-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer2-idcert --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/msp/signcerts/orderer2.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer2-idkey --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer2-cacert --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/msp/cacerts/ca.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging tls hlf--orderer2-tls --key=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/tls/server.key --cert=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer2-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer2.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer3-idcert --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/msp/signcerts/orderer3.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer3-idkey --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer3-cacert --from-file=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/msp/cacerts/ca.orderer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging tls hlf--orderer3-tls --key=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/tls/server.key --cert=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n orderer-staging generic hlf--orderer3-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer3.orderer/tls/ca.crt

    # enedis
    echo ---
    kubectl create  --dry-run=client -o yaml namespace enedis-staging
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic starchannel --from-file=./hlf/staging/generated/star.tx
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer1-idcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/msp/signcerts/peer1.enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer1-idkey --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer1-cacert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/msp/cacerts/ca.enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging tls hlf--peer1-tls --key=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/tls/server.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer1-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer1.enedis/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging tls hlf--peer1-tls-client --key=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/client.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer1-client-tlsrootcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer1-admincert --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/msp/signcerts/Admin@enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer1-adminkey --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/msp/keystore/priv_sk

    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer2-idcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer2.enedis/msp/signcerts/peer2.enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer2-idkey --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer2.enedis/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer2-cacert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer2.enedis/msp/cacerts/ca.enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging tls hlf--peer2-tls --key=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer2.enedis/tls/server.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer2.enedis/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer2-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/peers/peer2.enedis/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging tls hlf--peer2-tls-client --key=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/client.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer2-client-tlsrootcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer2-admincert --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/msp/signcerts/Admin@enedis-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic hlf--peer2-adminkey --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/users/Admin@enedis/msp/keystore/priv_sk

    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic star-peer-connection --from-file=connection.yaml=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/connection-enedis.yaml
    echo ---
    kubectl create secret --dry-run=client -o yaml -n enedis-staging generic star-user-id --from-file=User1.id=./hlf/staging/generated/crypto-config/peerOrganizations/enedis/User1.id

    # rte
    echo ---
    kubectl create  --dry-run=client -o yaml namespace rte-staging
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic starchannel --from-file=./hlf/staging/generated/star.tx
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer1-idcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/msp/signcerts/peer1.rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer1-idkey --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer1-cacert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/msp/cacerts/ca.rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging tls hlf--peer1-tls --key=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/server.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer1-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer1.rte/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging tls hlf--peer1-tls-client --key=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/client.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer1-client-tlsrootcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer1-admincert --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/msp/signcerts/Admin@rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer1-adminkey --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer2-idcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer2.rte/msp/signcerts/peer2.rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer2-idkey --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer2.rte/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer2-cacert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer2.rte/msp/cacerts/ca.rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging tls hlf--peer2-tls --key=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer2.rte/tls/server.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer2.rte/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer2-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/rte/peers/peer2.rte/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging tls hlf--peer2-tls-client --key=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/client.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer2-client-tlsrootcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer2-admincert --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/msp/signcerts/Admin@rte-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic hlf--peer2-adminkey --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/rte/users/Admin@rte/msp/keystore/priv_sk

    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic star-peer-connection --from-file=connection.yaml=./hlf/staging/generated/crypto-config/peerOrganizations/rte/connection-rte.yaml
    echo ---
    kubectl create secret --dry-run=client -o yaml -n rte-staging generic star-user-id --from-file=User1.id=./hlf/staging/generated/crypto-config/peerOrganizations/rte/User1.id

    # producer
    echo ---
    kubectl create  --dry-run=client -o yaml namespace producer-staging
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic starchannel --from-file=./hlf/staging/generated/star.tx
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--ord-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/ordererOrganizations/orderer/orderers/orderer1.orderer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer1-idcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/msp/signcerts/peer1.producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer1-idkey --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer1-cacert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/msp/cacerts/ca.producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging tls hlf--peer1-tls --key=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/tls/server.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer1-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer1.producer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging tls hlf--peer1-tls-client --key=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/client.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer1-client-tlsrootcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer1-admincert --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/msp/signcerts/Admin@producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer1-adminkey --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer2-idcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer2.producer/msp/signcerts/peer2.producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer2-idkey --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer2.producer/msp/keystore/priv_sk
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer2-cacert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer2.producer/msp/cacerts/ca.producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging tls hlf--peer2-tls --key=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer2.producer/tls/server.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer2.producer/tls/server.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer2-tlsrootcert --from-file=cacert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/producer/peers/peer2.producer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging tls hlf--peer2-tls-client --key=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/client.key --cert=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/client.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer2-client-tlsrootcert --from-file=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/tls/ca.crt
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer2-admincert --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/msp/signcerts/Admin@producer-cert.pem
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic hlf--peer2-adminkey --from-file=cert.pem=./hlf/staging/generated/crypto-config/peerOrganizations/producer/users/Admin@producer/msp/keystore/priv_sk

    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic star-peer-connection --from-file=connection.yaml=./hlf/staging/generated/crypto-config/peerOrganizations/producer/connection-producer.yaml
    echo ---
    kubectl create secret --dry-run=client -o yaml -n producer-staging generic star-user-id --from-file=User1.id=./hlf/staging/generated/crypto-config/peerOrganizations/producer/User1.id
}

generate_secrets > secrets-staging.yaml
