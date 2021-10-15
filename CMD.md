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
## global channel
export CHANNEL_NAME=starnetwork
export ORDERER=orderer.star.com:7050
export CHANNEL_TX_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetwork.tx
export ORDERER_TLSCA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel create -o $ORDERER -c $CHANNEL_NAME -f $CHANNEL_TX_FILE --tls --cafile $ORDERER_TLSCA

peer channel join -b $CHANNEL_NAME.block

## order channel
export CHANNEL_NAME=starnetworkorder
export CHANNEL_TX_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetworkorder.tx

peer channel create -o $ORDERER -c $CHANNEL_NAME -f $CHANNEL_TX_FILE --tls --cafile $ORDERER_TLSCA

peer channel join -b starnetworkorder.block

## global CC
peer lifecycle chaincode package global_V2.tar.gz --path /usr/src/app/chaincode/global_V2 --lang node --label global_2.0

peer lifecycle chaincode install global_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetwork
export CC_NAME=global_chaincode

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json

## order CC
peer lifecycle chaincode package order_V2.tar.gz --path /usr/src/app/chaincode/order_V2 --lang node --label order_2.0

peer lifecycle chaincode install order_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[1].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetworkorder
export CC_NAME=order_chaincode

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json 

exit
```

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

## order channel

export CHANNEL_NAME=starnetworkorder

peer channel fetch 0 -o $ORDERER -c $CHANNEL_NAME --tls --cafile $ORDERER_TLSCA 
peer channel join -b $CHANNEL_NAME\_0.block

## global CC

peer lifecycle chaincode package global_V2.tar.gz --path /usr/src/app/chaincode/global_V2 --lang node --label global_2.0

peer lifecycle chaincode install global_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetwork
export CC_NAME=global_chaincode

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA 

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json 

## order CC
peer lifecycle chaincode package order_V2.tar.gz --path /usr/src/app/chaincode/order_V2 --lang node --label order_2.0

peer lifecycle chaincode install order_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[1].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetworkorder
export CC_NAME=order_chaincode

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA 

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json 

peer lifecycle chaincode commit -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.tso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/tls/ca.crt --tls --cafile $ORDERER_TLSCA

exit
```

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

## global CC

peer lifecycle chaincode package global_V2.tar.gz --path /usr/src/app/chaincode/global_V2 --lang node --label global_2.0

peer lifecycle chaincode install global_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

export CHANNEL_NAME=starnetwork
export CC_NAME=global_chaincode

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLSCA

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --tls --cafile $ORDERER_TLSCA --output json 

peer lifecycle chaincode commit -o $ORDERER --tls --cafile $ORDERER_TLSCA --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.tso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/tls/ca.crt --peerAddresses peer0.dso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/dso.star.com/peers/peer0.dso.star.com/tls/ca.crt 

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

**TODO Fix login failed since TLS active**
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
docker rmi $(docker images -f dangling=true -q)
docker network prune -f ; docker volume prune -f
```








# MISC POC OVH
```bash
git clone https://github.com/rte-france/star.git

cd star/chaincode/global
npm install ; rm -rf ./dist ; npm run build

cd ../order
npm install ; rm -rf ./dist ; npm run build

cd ../../fabric-network
docker-compose -f docker-compose-fabric-orderer.yaml up -d
docker-compose -f docker-compose-fabric-tso.yaml up -d
docker-compose -f docker-compose-fabric-dso.yaml up -d
docker-compose -f docker-compose-fabric-third.yaml up -d
```

```bash
docker exec -it cli-peer0.tso.star.com bash

peer channel create -o orderer.star.com:7050 -c starnetwork -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem


peer channel join -b starnetwork.block

peer channel create -o orderer.star.com:7050 -c starnetworkorder -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel-order.tx --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel join -b starnetworkorder.block

peer chaincode install -n global_chaincode -l node -v 1.0 -p /usr/src/app/chaincode/global

peer chaincode instantiate -o orderer.star.com:7050 --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem -C starnetwork -n global_chaincode -l node -v '1.0' -c '{"Args":[""]}'

peer chaincode install -n order_chaincode -l node -v 1.0 -p /usr/src/app/chaincode/order

peer chaincode instantiate -o orderer.star.com:7050 --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem -C starnetworkorder -n order_chaincode -l node -v '1.0' -c '{"Args":[""]}'

exit
```

```bash
docker exec -it cli-peer0.dso.star.com bash

peer chaincode install -n global_chaincode -l node -v 1.0 -p /usr/src/app/chaincode/global

peer chaincode install -n order_chaincode -l node -v 1.0 -p /usr/src/app/chaincode/order

peer channel fetch 0 -o orderer.star.com:7050 -c starnetwork --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel fetch 0 -o orderer.star.com:7050 -c starnetworkorder --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel join -b starnetwork_0.block
peer channel join -b starnetworkorder_0.block

exit
```



```bash
docker exec -it cli-peer0.third.star.com bash

peer chaincode install -n global_chaincode -l node -v 1.0 -p /usr/src/app/chaincode/global

peer channel fetch 0 -o orderer.star.com:7050 -c starnetwork --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/star.com/orderers/orderer.star.com/msp/tlscacerts/tlsca.star.com-cert.pem

peer channel join -b starnetwork_0.block

exit
```

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
http://poc.star.eniblock.fr:5000/login
# user.star@dso1.com user.star@dso2.com user.star@dso3.com passw0rd
http://poc.star.eniblock.fr:5001/login
# user.star@bsp1.com user.star@bsp2.com user.star@bsp3.com passw0rd
http://poc.star.eniblock.fr:5002/login
# user.star@eolien-alize.com user.star@eolien-mistral.com user.star@eolien-zephyr.com passw0rd
http://poc.star.eniblock.fr:5003/login
```
## Swagger
```bash
#TSO
http://poc.star.eniblock.fr:3000/swagger
#DSO
http://poc.star.eniblock.fr:3001/swagger
#BSP
http://poc.star.eniblock.fr:3002/swagger
#Producer
http://poc.star.eniblock.fr:3003/swagger
```


## Check the URLs
```bash
# user.star@tso1.com passw0rd
http://51.91.145.25:5000/login

# user.star@dso1.com user.star@dso2.com user.star@dso3.com passw0rd
http://51.91.145.25:5001/login

# user.star@bsp1.com user.star@bsp2.com user.star@bsp3.com passw0rd
http://51.91.145.25:5002/login

# user.star@eolien-alize.com user.star@eolien-mistral.com user.star@eolien-zephyr.com passw0rd
http://51.91.145.25:5003/login
```

## Swagger
```bash
#TSO
http://51.91.145.25:3000/swagger

#DSO
http://51.91.145.25:3001/swagger

#BSP
http://51.91.145.25:3002/swagger

#Producer
http://51.91.145.25:3003/swagger
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

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"
# peer lifecycle chaincode approveformyorg -o $ORDERER --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" --output json 
# --tls --cafile $ORDERER_TLS_CA 

# peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1  --output json --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode commit -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
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

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"
# peer lifecycle chaincode approveformyorg -o $ORDERER --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" --output json 
# --tls --cafile $ORDERER_TLS_CA 

# peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --init-required --channelID $CHANNEL_NAME --name $CC_NAME --version 1.0 --sequence 1  --output json --tls --cafile $ORDERER_TLS_CA 

peer lifecycle chaincode commit -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
# --tls --cafile $ORDERER_TLS_CA --init-required --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.org2.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --signature-policy "OR('Org1MSP.peer', 'Org2MSP.peer')"


```

```bash
docker exec -it cli-peer0.dso.star.com bash
```
```bash
export CHANNEL_NAME=starnetworkorder
export CC_NAME=order_chaincode

peer channel fetch 0 $CHANNEL_NAME.block -c $CHANNEL_NAME --orderer $ORDERER
#  --tls --cafile $ORDERER0_TLS_CACERT

peer channel join -b starnetworkorder.block

peer lifecycle chaincode package order_V2.tar.gz --path /usr/src/app/chaincode/order_V2 --lang node --label order_2.0

peer lifecycle chaincode install order_V2.tar.gz 

peer lifecycle chaincode queryinstalled --output json

export CC_PACKAGE_ID=`peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes | .[0].package_id '`
echo $CC_PACKAGE_ID

peer lifecycle chaincode approveformyorg -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --package-id $CC_PACKAGE_ID --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')"

peer lifecycle chaincode queryapproved -C $CHANNEL_NAME -n $CC_NAME --output json

peer lifecycle chaincode checkcommitreadiness -o orderer0.star.com:7050 --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" --output json 

peer lifecycle chaincode commit -o $ORDERER --channelID $CHANNEL_NAME --name $CC_NAME --version 2.0 --sequence 1 --peerAddresses $CORE_PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE --peerAddresses peer0.tso.star.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/tso.star.com/peers/peer0.tso.star.com/tls/ca.crt --signature-policy "OR('TSOMSP.peer', 'DSOMSP.peer')" 
# --init-required 
#  --tls --cafile $ORDERER_TLS_CA 
```

TSO, DSO, THIRD, BSP, PRODUCER -->