#!/bin/bash

ONLINE_MODE=true
PAUSE_TIME=0s
if $ONLINE_MODE
then
    PAUSE_TIME=5s
fi

if $ONLINE_MODE
then
    OLD_IFS=$IFS
    source ../config/config.sh
    IFS=$OLD_IFS
fi

DATA_PATH=../data/ActivationDocuments

echo "***************************************"
echo "Start of invoke command"
echo ""

echo "***********************************"
echo
echo "** RTE - PING And LOG"
echo

echo ""
echo "PING"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["ping"]}'

echo ""
echo "LOG RTE"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["testLog"]}'


echo ""
echo "LOG LEVEL DEBUG"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["setLogLevel", "DEBUG"]}'

echo ""
echo "LOG RTE"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["testLog"]}'

echo ""
echo "LOG ENEDIS"
echo ""

kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $ENEDIS_TLSOPT \
        -c '{"Args":["testLog"]}'

echo ""
echo "LOG LEVEL INFO"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["setLogLevel", "INFO"]}'

echo ""
echo "LOG RTE"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["testLog"]}'

echo ""
echo "LOG ENEDIS"
echo ""

kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $ENEDIS_TLSOPT \
        -c '{"Args":["testLog"]}'

echo ""
echo "LOG LEVEL WARNING"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["setLogLevel", "WARNING"]}'

echo ""
echo "LOG RTE"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["testLog"]}'

echo ""
echo "LOG ENEDIS"
echo ""

kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $ENEDIS_TLSOPT \
        -c '{"Args":["testLog"]}'

echo ""
echo "LOG LEVEL ERROR"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["setLogLevel", "ERROR"]}'


echo ""
echo "LOG LEVEL INFO"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["setLogLevel", "INFO"]}'

echo ""
echo "LOG RTE"
echo ""

kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
    peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
        --tls $RTE_TLSOPT \
        -c '{"Args":["testLog"]}'


# echo "***********************************"
# echo
# echo "** ENEDIS - PING"
# echo

# kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#     peer chaincode invoke \
#         -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#         --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
#         -c '{"Args":["ping"]}'


echo ""
echo "End of invoke command"
echo "***************************************"
