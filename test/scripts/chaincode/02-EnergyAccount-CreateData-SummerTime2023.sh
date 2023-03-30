#!/bin/bash

ONLINE_MODE=true

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS

echo "***************************************"
echo "Start of invoke command"
echo ""


echo "***********************************"
echo
echo "** ENEDIS - ENERGY ACCOUNT CREATION"
echo

ENEDIS_ENERGYACCOUNTS=$(cat $DATA_PATH/02-EnergyAccount/54-HTA-EnergyAccount_SummerTime2023.json | jq '.')
ENEDIS_ENERGYACCOUNTS_NB=$(echo $ENEDIS_ENERGYACCOUNTS | jq 'length')

for i in `seq $ENEDIS_ENERGYACCOUNTS_NB`
do
    tabindex=$(echo ".["$i-1"]")
    INITIAL_energyAccountMarketDocumentMrid=$(echo $ENEDIS_ENERGYACCOUNTS | jq $tabindex | jq '.energyAccountMarketDocumentMrid')
    energyAccountMarketDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    energyAccountMarketDocumentMrid=$(echo "energyAccount_enedis_$energyAccountMarketDocumentMrid")
    ENEDIS_ENERGYACCOUNTS_VALUE=$(echo $ENEDIS_ENERGYACCOUNTS | jq $tabindex | jq --arg value $energyAccountMarketDocumentMrid '. + {energyAccountMarketDocumentMrid: $value}')
    ENEDIS_ENERGYACCOUNTS_VALUE_STR=$(echo $ENEDIS_ENERGYACCOUNTS_VALUE | sed "s/\"/\\\\\"/g")
    ENEDIS_ENERGYACCOUNTS_VALUE_STR=${ENEDIS_ENERGYACCOUNTS_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $ENEDIS_NODE Energy Account : $INITIAL_energyAccountMarketDocumentMrid"
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


echo ""
echo "End of invoke command"
echo "***************************************"
