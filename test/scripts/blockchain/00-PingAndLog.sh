#!/bin/bash

ONLINE_MODE=false

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS


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

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["ping"]}'
fi

echo ""
echo "LOG RTE"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["testLog"]}'
fi

echo ""
echo "LOG LEVEL DEBUG"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["setLogLevel", "DEBUG"]}'
fi

echo ""
echo "LOG RTE"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["testLog"]}'
fi

echo ""
echo "LOG ENEDIS"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $ENEDIS_TLSOPT \
            -c '{"Args":["testLog"]}'
fi

echo ""
echo "LOG LEVEL INFO"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["setLogLevel", "INFO"]}'
fi

echo ""
echo "LOG RTE"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["testLog"]}'
fi

echo ""
echo "LOG ENEDIS"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $ENEDIS_TLSOPT \
            -c '{"Args":["testLog"]}'
fi

echo ""
echo "LOG LEVEL WARNING"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["setLogLevel", "WARNING"]}'
fi

echo ""
echo "LOG RTE"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["testLog"]}'
fi

echo ""
echo "LOG ENEDIS"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $ENEDIS_TLSOPT \
            -c '{"Args":["testLog"]}'
fi

echo ""
echo "LOG LEVEL ERROR"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["setLogLevel", "ERROR"]}'
fi

echo ""
echo "LOG LEVEL INFO"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["setLogLevel", "INFO"]}'
fi

echo ""
echo "LOG RTE"
echo ""

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $RTE_TLSOPT \
            -c '{"Args":["testLog"]}'
fi


echo ""
echo "End of invoke command"
echo "***************************************"
