# Star v2.3.3
```bash
cd star
```

```bash
cd resources/conf

export FABRIC_CFG_PATH=$(realpath generate-artifacts)
echo $FABRIC_CFG_PATH
ls -la $FABRIC_CFG_PATH

# cryptogen extend --input=../conf/infra/crypto-config --config=generate-artifacts/crypto-config.yaml

# configtxgen -profile StarOrdererGenesis -outputBlock ./channel-artifacts/genesis.block

configtxgen -profile StarOrdererGenesis -channelID system-channel -outputBlock ./infra/channel-artifacts/genesis.block

configtxgen -profile starnetwork -outputCreateChannelTx ./infra/channel-artifacts/starnetwork.tx -channelID starnetwork

configtxgen -profile starnetwork -outputAnchorPeersUpdate ./infra/channel-artifacts/starnetwork-TSO.tx -channelID starnetwork -asOrg TSOMSP

configtxgen -profile starnetwork -outputAnchorPeersUpdate ./infra/channel-artifacts/starnetwork-DSO.tx -channelID starnetwork -asOrg DSOMSP

configtxgen -profile starnetwork -outputAnchorPeersUpdate ./infra/channel-artifacts/starnetwork-THIRD.tx -channelID starnetwork -asOrg THIRDMSP

# configtxgen -profile starnetwork -outputAnchorPeersUpdate ./infra/channel-artifacts/starnetwork-BSP.tx -channelID starnetwork -asOrg BSP

# configtxgen -profile starnetwork -outputAnchorPeersUpdate ./infra/channel-artifacts/starnetwork-PRODUCER.tx -channelID starnetwork -asOrg PRODUCER

configtxgen -profile starnetworkorder -outputCreateChannelTx ./infra/channel-artifacts/starnetworkorder.tx -channelID starnetworkorder

configtxgen -profile starnetworkorder -outputAnchorPeersUpdate ./infra/channel-artifacts/starnetworkorder-TSO.tx -channelID starnetworkorder -asOrg TSOMSP

configtxgen -profile starnetworkorder -outputAnchorPeersUpdate ./infra/channel-artifacts/starnetworkorder-DSO.tx -channelID starnetworkorder -asOrg DSOMSP
```

## build Chaincodes
### Order
```bash
cd ../../chaincode/order_V2
npm install ; rm -rf ./dist ; npm run build
npm run test # fail sine V2
```

### Global
```bash
cd ../global_V2
npm install ; rm -rf ./dist ; npm run build
npm run test # fail since V2
```

## Deploy HLF
```bash
cd ../../fabric-network 

docker-compose -f docker-compose-fabric-orderer.yaml up -d
docker-compose -f docker-compose-fabric-tso.yaml up -d
docker-compose -f docker-compose-fabric-dso.yaml up -d
docker-compose -f docker-compose-fabric-third.yaml up -d
```


## Channel & chaincodes

### CLI TSO
```bash
docker exec -it cli-peer0.tso.star.com bash
```
**inside CLI**
```bash
peer channel create -o orderer.star.com:7050 -c starnetwork -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetwork.tx

## TLS
# peer channel create -o orderer.star.com:7050 -c starnetwork -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetwork.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel join -b starnetwork.block

peer channel create -o orderer.star.com:7050 -c starnetworkorder -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetworkorder.tx 

## TLS
# peer channel create -o orderer.star.com:7050 -c starnetworkorder -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetworkorder.tx  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel join -b starnetworkorder.block

peer lifecycle chaincode package global_V2.tar.gz --path /usr/src/app/chaincode/global_V2 --lang node --label global_2.0

peer lifecycle chaincode install global_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetwork
export CC_NAME=global_chaincode

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --output json
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"  

## order CC
peer lifecycle chaincode package order_V2.tar.gz --path /usr/src/app/chaincode/order_V2 --lang node --label order_2.0

peer lifecycle chaincode install order_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[1].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetworkorder
export CC_NAME=order_chaincode

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --output json 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 

exit
```

## CLI DSO
```bash
docker exec -it cli-peer0.dso.star.com bash
```

**Inside CLI**
```bash
peer channel fetch 0 -o orderer.star.com:7050 -c starnetwork
peer channel join -b starnetwork_0.block

peer channel fetch 0 -o orderer.star.com:7050 -c starnetworkorder 
peer channel join -b starnetworkorder_0.block

peer lifecycle chaincode package global_V2.tar.gz --path /usr/src/app/chaincode/global_V2 --lang node --label global_2.0

peer lifecycle chaincode install global_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetwork
export CC_NAME=global_chaincode

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --output json 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 

##order CC
peer lifecycle chaincode package order_V2.tar.gz --path /usr/src/app/chaincode/order_V2 --lang node --label order_2.0

peer lifecycle chaincode install order_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[1].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetworkorder
export CC_NAME=order_chaincode

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --output json 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 

peer lifecycle chaincode commit -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.tso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/tls/ca.crt

exit
```

## CLI THIRD
```bash
docker exec -it cli-peer0.third.star.com bash
```
**Inside CLI**
```bash
peer channel fetch 0 -o orderer.star.com:7050 -c starnetwork
peer channel join -b starnetwork_0.block

peer lifecycle chaincode package global_V2.tar.gz --path /usr/src/app/chaincode/global_V2 --lang node --label global_2.0

peer lifecycle chaincode install global_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetwork
export CC_NAME=global_chaincode

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --output json 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 

peer lifecycle chaincode commit -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.tso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/tls/ca.crt --peerAddresses peer0.dso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/dso.star.com/peers/peer0.dso.star.com/tls/ca.crt 
# --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 

exit
```

## Deploy Star demo (server, client, reverse-proxy)
```bash
cd ../server 

docker-compose -f docker-compose-tso.yaml up -d --build
docker-compose -f docker-compose-dso.yaml up -d --build
docker-compose -f docker-compose-bsp.yaml up -d --build
docker-compose -f docker-compose-producer.yaml up -d --build
```

## Check the URLs
```bash
# user.star@tso1.com passw0rd
http://localhost:5000/login

# user.star@dso1.com user.star@dso2.com user.star@dso3.com passw0rd
http://localhost:5001/login

# user.star@bsp1.com user.star@bsp2.com user.star@bsp3.com passw0rd
http://localhost:5002/login

# user.star@eolien-alize.com user.star@eolien-mistral.com user.star@eolien-zephyr.com passw0rd
http://localhost:5003/login
```
## Swagger
```bash
#TSO
http://localhost:3000/swagger

#DSO
http://localhost:3001/swagger

#BSP
http://localhost:3002/swagger

#Producer
http://localhost:3003/swagger
```

# deep clean all docker 
```bash
docker rm $(docker stop $(docker ps -aq))
docker rmi $(docker images | grep dev | awk '{print $1}')
docker rmi $(docker images | grep server | awk '{print $1}')
docker network prune -f ; docker volume prune -f
```

























<!-- 

### Chaincode OrderV2
**Package**
```bash
# peer lifecycle chaincode package global_V2.tar.gz --path /usr/src/app/chaincode/global_V2 --lang node --label global_2.0

peer lifecycle chaincode package order_V2.tar.gz --path /usr/src/app/chaincode/order_V2 --lang node --label order_2.0
```

**Install**
```bash
# peer lifecycle chaincode install global_V2.tar.gz 
peer lifecycle chaincode install order_V2.tar.gz 
```

**Check queryinstalled**
```bash
peer lifecycle chaincode queryinstalled --output json
```

**Approve Chaincode global on star network**
```bash
export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export ORDERER_TLS_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem
ls -la $ORDERER_TLS_CA

export CHANNEL_NAME=starnetwork
export CC_NAME=global_chaincode

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"
# peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" --output json 
# --tls --cafile $ORDERER_TLS_CA 

# peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1  --output json --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode commit -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
# --tls --cafile $ORDERER_TLS_CA --init-required --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.org2.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer')"

```


**Approve Chaincode order on star network**
```bash
export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export ORDERER_TLS_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem
ls -la $ORDERER_TLS_CA

export CHANNEL_NAME=starnetworkorder
export CC_NAME=order_chaincode

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"
# peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" --output json 
# --tls --cafile $ORDERER_TLS_CA 

# peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1  --output json --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode commit -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
# --tls --cafile $ORDERER_TLS_CA --init-required --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.org2.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer')"


```

```bash
docker exec -it cli-peer0.dso.star.com bash
```
```bash
export CHANNEL_NAME=starnetworkorder
export CC_NAME=order_chaincode

peer channel fetch 0 $CHANNEL_NAME.block -c $CHANNEL_NAME --orderer orderer.star.com:7050
#  --tls --cafile $ORDERER0_TLS_CACERT

peer channel join -b starnetworkorder.block

peer lifecycle chaincode package order_V2.tar.gz --path /usr/src/app/chaincode/order_V2 --lang node --label order_2.0

peer lifecycle chaincode install order_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

peer lifecycle chaincode approveformyorg -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" --output json 

peer lifecycle chaincode commit -o orderer.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.tso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/tls/ca.crt --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
# --init-required 
#  --tls --cafile $ORDERER_TLS_CA 
```

TSO, DSO, THIRD, BSP, PRODUCER -->