# Star v2.3.3
```bash
cd XDEV/star/old-poc/
```

```bash
cd resources/conf

export FABRIC_CFG_PATH=$(realpath generate-artifacts)
echo $FABRIC_CFG_PATH
ls -la $FABRIC_CFG_PATH
```

## Deploy HLF
```bash
cd ../../fabric-network 

docker-compose -f docker-compose-fabric-orderer.yaml up -d
docker-compose -f docker-compose-fabric-tso.yaml up -d
docker-compose -f docker-compose-fabric-dso.yaml up -d
docker-compose -f docker-compose-fabric-third.yaml up -d
```
## Channel

### CLI TSO
```bash
docker exec -it cli-peer0.tso.star.com bash
```
**inside CLI**
```bash
## global channel
export CHANNEL_NAME=starnetwork
export ORDERER=orderer.star.com:7050
export CHANNEL_TX_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetwork.tx
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel create -o $ORDERER -c $CHANNEL_NAME -f $CHANNEL_TX_FILE --tls --cafile $ORDERER_TLSCA

peer channel join -b $CHANNEL_NAME.block

# STAR CC

cd /usr/src/app/chaincode/star/package/TSO

tar cvzf code.tar.gz connection.json

tar cvzf star_V1.tar.gz metadata.json code.tar.gz

peer lifecycle chaincode install star_V1.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

sed "s/CC_PACKAGE_ID/$CC_PACKAGE_ID/" chaincode.env > ../../chaincode.env
sed "s/CC_PACKAGE_ID/$CC_PACKAGE_ID/" package.json > ../../package.json

cat ../../chaincode.env | grep star
cat ../../package.json | grep star  

sed "s/CHAINCODE_ID/$CC_PACKAGE_ID/" ../../Dockerfile.bkp > ../../Dockerfile
```

### open a new terminal
```bash
## build external CC container

cd ~/XDEV/star/old-poc/chaincode/star

cat Dockerfile 

docker build -t star/tso.star .

docker run -d --hostname star.tso.star.com --env-file chaincode.env --network=star star/tso.star
```

### Back in TSO CLI
```bash
export CHANNEL_NAME=starnetwork
export CC_NAME=star

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"
```


# new terminal

## CLI DSO
```bash
docker exec -it cli-peer0.dso.star.com bash
```

**Inside CLI**
```bash
## global channel

export ORDERER=orderer.star.com:7050
export CHANNEL_NAME=starnetwork
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel fetch 0 -o $ORDERER -c $CHANNEL_NAME --tls --cafile $ORDERER_TLSCA
peer channel join -b $CHANNEL_NAME\_0.block

# STAR CC

cd /usr/src/app/chaincode/star/package/DSO

tar cvzf code.tar.gz connection.json

tar cvzf star_V1.tar.gz metadata.json code.tar.gz

peer lifecycle chaincode install star_V1.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

sed "s/CC_PACKAGE_ID/$CC_PACKAGE_ID/" chaincode.env > ../../chaincode.env
sed "s/CC_PACKAGE_ID/$CC_PACKAGE_ID/" package.json > ../../package.json

cat ../../chaincode.env | grep star
cat ../../package.json | grep star  

sed "s/CHAINCODE_ID/$CC_PACKAGE_ID/" ../../Dockerfile.bkp > ../../Dockerfile
```


### open a new terminal
```bash
## build external CC container

cd ~/XDEV/star/old-poc/chaincode/star

cat Dockerfile

docker build -t star/dso.star .

docker run -d --hostname star.dso.star.com --env-file chaincode.env --network=star star/dso.star
```

### Back in DSO CLI
```bash
export CHANNEL_NAME=starnetwork
export CC_NAME=star

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"
```


# new terminal

## CLI THIRD
```bash
docker exec -it cli-peer0.third.star.com bash
```

**Inside CLI**
```bash
## global channel
export ORDERER=orderer.star.com:7050
export CHANNEL_NAME=starnetwork
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel fetch 0 -o $ORDERER -c $CHANNEL_NAME --tls --cafile $ORDERER_TLSCA
peer channel join -b $CHANNEL_NAME\_0.block

# STAR CC

cd /usr/src/app/chaincode/star/package/BNO

tar cvzf code.tar.gz connection.json

tar cvzf star_V1.tar.gz metadata.json code.tar.gz

peer lifecycle chaincode install star_V1.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

sed "s/CC_PACKAGE_ID/$CC_PACKAGE_ID/" chaincode.env > ../../chaincode.env
sed "s/CC_PACKAGE_ID/$CC_PACKAGE_ID/" package.json > ../../package.json

cat ../../chaincode.env | grep star
cat ../../package.json | grep star  

sed "s/CHAINCODE_ID/$CC_PACKAGE_ID/" ../../Dockerfile.bkp > ../../Dockerfile

```

### open a new terminal
```bash
## build external CC container

cd ~/XDEV/star/old-poc/chaincode/star

cat Dockerfile

docker build -t star/bno.star .

docker run -d --hostname star.bno.star.com --env-file chaincode.env --network=star star/bno.star
```

### Back in TSO CLI
```bash
export CHANNEL_NAME=starnetwork
export CC_NAME=star

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
```

## commit chaincode
```bash
peer lifecycle chaincode commit -o $ORDERER --tls --cafile $ORDERER_TLSCA --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.tso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/tls/ca.crt --peerAddresses peer0.dso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/dso.star.com/peers/peer0.dso.star.com/tls/ca.crt --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
```

## TEST CHAINCODE
## TSO

```bash
docker exec -it cli-peer0.tso.star.com bash

export ORDERER=orderer.star.com:7050
export CHANNEL_NAME=starnetwork
export CC_NAME=star
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem


peer chaincode invoke -c '{"Args":["GetAllSystemOperator"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.dso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/dso.star.com/peers/peer0.dso.star.com/tls/ca.crt

# peer chaincode invoke -c '{"Args":["invoke","a","b","10"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.dso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/dso.star.com/peers/peer0.dso.star.com/tls/ca.crt

## NOK
# peer chaincode invoke -c '{"function":"Query","args":["B"]}' -C $CHANNEL_NAME -n $CC_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE 
```


# test docker local 
```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="RTEMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/rte.star.com/peers/peer0.rte.star.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/rte.star.com/users/Admin@rte.star.com/msp
export CORE_PEER_ADDRESS=peer0.rte.star.com:7051

export ORDERER=orderer.star.com:7050
export CHANNEL_NAME=star
export CC_NAME=star
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem


peer chaincode invoke -c '{"Args":["GetAllSystemOperator"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.enedis.star.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/enedis.star.com/peers/peer0.enedis.star.com/tls/ca.crt

peer chaincode invoke -c '{"function":"CreateSystemOperator","args":["{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.enedis.star.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/enedis.star.com/peers/peer0.enedis.star.com/tls/ca.crt
# --peerAddresses peer0.dso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/dso.star.com/peers/peer0.dso.star.com/tls/ca.crt --peerAddresses peer0.third.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/third.star.com/peers/peer0.third.star.com/tls/ca.crt

```

# Change Endorsement Policy
## RTE
```bash
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --package-id $CC_PACKAGE_ID --sequence 2 --tls --cafile $ORDERER_TLSCA --signature-policy "OR('RTEMSP.peer', 'ENEDISMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 2 --tls --cafile $ORDERER_TLSCA --output json --signature-policy "OR('RTEMSP.peer', 'ENEDISMSP.peer')"
```

## Enedis
```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="ENEDISMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/enedis.star.com/peers/peer0.enedis.star.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/enedis.star.com/users/Admin@enedis.star.com/msp
export CORE_PEER_ADDRESS=peer0.enedis.star.com:9051

export ORDERER=orderer.star.com:7050
export CHANNEL_NAME=star
export CC_NAME=star
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem



peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --package-id $CC_PACKAGE_ID --sequence 2 --tls --cafile $ORDERER_TLSCA --signature-policy "OR('RTEMSP.peer', 'ENEDISMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 2 --tls --cafile $ORDERER_TLSCA --output json --signature-policy "OR('RTEMSP.peer', 'ENEDISMSP.peer')"

peer lifecycle chaincode commit -o $ORDERER --tls --cafile $ORDERER_TLSCA --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 2 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.rte.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/rte.star.com/peers/peer0.rte.star.com/tls/ca.crt --signature-policy "OR('RTEMSP.peer', 'ENEDISMSP.peer')"

peer chaincode invoke -c '{"function":"CreateSystemOperator","args":["{\"systemOperatorMarketParticipantMrId\": \"ENEDIS01EIC\",\"marketParticipantName\": \"ENEDIS\",\"marketParticipantRoleType\": \"A50\"}"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE
 # --peerAddresses peer0.rte.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/rte.star.com/peers/peer0.rte.star.com/tls/ca.crt


peer chaincode invoke -c '{"Args":["GetAllSystemOperator"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.rte.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/rte.star.com/peers/peer0.rte.star.com/tls/ca.crt

```

## RTE
```bash
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="RTEMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/rte.star.com/peers/peer0.rte.star.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/rte.star.com/users/Admin@rte.star.com/msp
export CORE_PEER_ADDRESS=peer0.rte.star.com:7051

export ORDERER=orderer.star.com:7050
export CHANNEL_NAME=star
export CC_NAME=star
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem


peer chaincode invoke -c '{"function":"CreateSystemOperator","args":["{\"systemOperatorMarketParticipantMrId\": \"RTE01EIC\",\"marketParticipantName\": \"RTE\",\"marketParticipantRoleType\": \"A49\"}"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE

peer chaincode invoke -c '{"Args":["GetAllSystemOperator"]}' -n $CC_NAME -C $CHANNEL_NAME --waitForEvent -o $ORDERER --cafile $ORDERER_TLSCA --tls --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.enedis.star.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/enedis.star.com/peers/peer0.enedis.star.com/tls/ca.crt

```