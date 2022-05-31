#!/bin/sh

PODNAME=$(kubectl get pod -n rte -l app.kubernetes.io/component=peer -o name)
VAR=$(kubectl exec -n rte -c peer $PODNAME -- env)

VAR1=$(echo "$VAR" | grep CORE_PEER_ADDRESS)
VAR2=$(echo "$VAR" | grep CORE_PEER_TLS_ROOTCERT_FILE)

VALUE_CORE_PEER_ADDRESS=${VAR1##*CORE_PEER_ADDRESS=}
VALUE_CORE_PEER_TLS_ROOTCERT_FILE=${VAR2##*CORE_PEER_TLS_ROOTCERT_FILE=}

CHAINCODE=star
CHANNEL=star
ORDERER=orderer1.orderer.localhost:443
CAFILE=/var/hyperledger/tls/ord/cert/cacert.pem


echo "***************************************"
echo "Start of invoke command"
echo ""

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["writePrivateData"]}'


kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["getPrivateData"]}'

echo ""
echo "End of invoke command"
echo "***************************************"
