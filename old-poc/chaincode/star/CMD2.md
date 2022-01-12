# Star v2.3.3
```bash
cd star
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

## order channel
export CHANNEL_NAME=starnetworkorder
export CHANNEL_TX_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/starnetworkorder.tx

peer channel create -o $ORDERER -c $CHANNEL_NAME -f $CHANNEL_TX_FILE --tls --cafile $ORDERER_TLSCA

peer channel join -b starnetworkorder.block


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
```

### open a new terminal
```bash
## build external CC container

cd ~/XDEV/star/old-poc/chaincode/star


docker build -t star/tso.star_V1 .

docker run -d --hostname star.tso.star.com --env-file chaincode.env --network=star star/tso.star





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

## order channel

export CHANNEL_NAME=starnetworkorder

peer channel fetch 0 -o $ORDERER -c $CHANNEL_NAME --tls --cafile $ORDERER_TLSCA 
peer channel join -b $CHANNEL_NAME\_0.block
````

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
```

`