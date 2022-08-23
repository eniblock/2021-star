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
echo "** ENEDIS - ENERGY ACCOUNT CREATION"
echo

ENEDIS_ENERGYACCOUNTS=$(cat $DATA_PATH/51-HTA-EnergyAccount.json | jq '.')
ENEDIS_ENERGYACCOUNTS_NB=$(echo $ENEDIS_ENERGYACCOUNTS | jq 'length')

for i in `seq $ENEDIS_ENERGYACCOUNTS_NB`
do
    tabindex=$(echo ".["$i-1"]")
    energyAccountMarketDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    energyAccountMarketDocumentMrid=$(echo "energyAccount_enedis_$energyAccountMarketDocumentMrid")
    ENEDIS_ENERGYACCOUNTS_VALUE=$(echo $ENEDIS_ENERGYACCOUNTS | jq $tabindex | jq --arg value $energyAccountMarketDocumentMrid '. + {energyAccountMarketDocumentMrid: $value}')
    ENEDIS_ENERGYACCOUNTS_VALUE_STR=$(echo $ENEDIS_ENERGYACCOUNTS_VALUE | sed "s/\"/\\\\\"/g")
    ENEDIS_ENERGYACCOUNTS_VALUE_STR=${ENEDIS_ENERGYACCOUNTS_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $ENEDIS_NODE Energy Account : $ENEDIS_ENERGYACCOUNTS_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT \
                -c '{"Args":["CreateEnergyAccount","'$ENEDIS_ENERGYACCOUNTS_VALUE_STR'"]}'
    fi

done


echo "***********************************"
echo
echo "** RTE - ENERGY ACCOUNT CREATION"
echo

RTE_ENERGYACCOUNTS=$(cat $DATA_PATH/52-HTB-EnergyAccount.json | jq '.')
RTE_ENERGYACCOUNTS_NB=$(echo $RTE_ENERGYACCOUNTS | jq 'length')

for i in `seq $RTE_ENERGYACCOUNTS_NB`
do
    tabindex=$(echo ".["$i-1"]")
    energyAccountMarketDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    energyAccountMarketDocumentMrid=$(echo "energyAccount_rte_$energyAccountMarketDocumentMrid")
    RTE_ENERGYACCOUNTS_VALUE=$(echo $RTE_ENERGYACCOUNTS | jq $tabindex | jq --arg value $energyAccountMarketDocumentMrid '. + {energyAccountMarketDocumentMrid: $value}')
    RTE_ENERGYACCOUNTS_VALUE_STR=$(echo $RTE_ENERGYACCOUNTS_VALUE | sed "s/\"/\\\\\"/g")
    RTE_ENERGYACCOUNTS_VALUE_STR=${RTE_ENERGYACCOUNTS_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $RTE_NODE Energy Account : $RTE_ENERGYACCOUNTS_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $RTE_TLSOPT \
                -c '{"Args":["CreateEnergyAccount","'$RTE_ENERGYACCOUNTS_VALUE_STR'"]}'
    fi

done


echo ""
echo "End of invoke command"
echo "***************************************"
