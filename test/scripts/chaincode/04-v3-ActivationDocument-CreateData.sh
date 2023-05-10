#!/bin/bash

ONLINE_MODE=true

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS


echo "***************************************"
echo "Start of invoke command"
echo ""



IdListRTE_PRODUCER=()
IdListRTE_ENEDIS=()
IdListENEDIS_PRODUCER=()
declare -A map_ACTIVATIONDOCUMENTS

echo "***********************************"
echo
echo "** RTE to PRODUCER - ACTIVATION DOCUMENTS DATA CREATION START"
echo

RTE_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/04-ActivationDocuments/51-v3-rte-OrdreLimitation.json | jq '.')
RTE_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq 'length')
RTE_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

for i in `seq $RTE_ACTIVATIONDOCUMENT_VALUE_NB`
do
    index=$(($i-1))
    activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    activationDocumentMrid=$(echo "activationDocument_rte_$activationDocumentMrid")
    IdListRTE_PRODUCER+=( $activationDocumentMrid )
    ELEMENT_VALUE=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
    ELEMENT_VALUE=${ELEMENT_VALUE//[$'\t\r\n ']}
    map_ACTIVATIONDOCUMENTS[$activationDocumentMrid]=$ELEMENT_VALUE
    RTE_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
done
RTE_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
RTE_ACTIVATIONDOCUMENT_VALUE_STR=${RTE_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
            -c '{"Args":["CreateActivationDocumentList","'$RTE_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
fi


echo
echo "wait $PAUSE_TIME"
sleep $PAUSE_TIME


echo "***********************************"
echo
echo "** ENEDIS - ACTIVATION DOCUMENTS DATA CREATION"
echo

ENEDIS_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/04-ActivationDocuments/52-v3-enedis-OrdreLimitation.json | jq '.')
ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq 'length')
ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

for i in `seq $ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB`
do
    index=$(($i-1))
    activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    activationDocumentMrid=$(echo "activationDocument_enedis_$activationDocumentMrid")
    IdListENEDIS_PRODUCER+=( $activationDocumentMrid )
    ELEMENT_VALUE=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
    ELEMENT_VALUE=${ELEMENT_VALUE//[$'\t\r\n ']}
    map_ACTIVATIONDOCUMENTS[$activationDocumentMrid]=$ELEMENT_VALUE
    ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
done
ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=${ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

if $ONLINE_MODE
then
    kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
            -c '{"Args":["CreateActivationDocumentList","'$ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
fi



echo "***********************************"
echo
echo "** ENEDIS->PRODUCER - ENERGY AMOUNT CREATION"
echo

ENEDIS_ENERGYAMOUNT=$(cat $DATA_PATH/05-EnergyAmount/71-v3-HTA-EnergyAmount.json | jq '.')
ENEDIS_ENERGYAMOUNT_LIST_VALUE=$(echo "[]" | jq '.')

indextable=0
for activationDocumentMrid in ${IdListENEDIS_PRODUCER[@]}; do
    activationDocument=${map_ACTIVATIONDOCUMENTS[$activationDocumentMrid]}

    energyAmountMarketDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    energyAmountMarketDocumentMrid=$(echo "energyAmount_enedis_$energyAmountMarketDocumentMrid")

    registeredResourceMrid=$(echo $activationDocument | jq '.registeredResourceMrid')
    quantity=$(($RANDOM%1000))
    senderMarketParticipantMrid=$(echo $activationDocument | jq '.senderMarketParticipantMrid')
    receiverMarketParticipantMrid=$(echo $activationDocument | jq '.receiverMarketParticipantMrid')
    createdDateTime=$(echo $activationDocument | jq '.startCreatedDateTime')
    startDateTime=$(echo $activationDocument | jq '.startCreatedDateTime')
    endDateTime=$(echo $activationDocument | jq '.endCreatedDateTime')
    if [ "["$endDateTime"]" = "[null]" ]; then
        endDateTime=" \""
    fi
    timeInterval=$(echo ${startDateTime::-1}"/"${endDateTime:1})

    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT | jq '.' | jq --arg energyAmountMarketDocumentMrid $energyAmountMarketDocumentMrid '. + {energyAmountMarketDocumentMrid: $energyAmountMarketDocumentMrid}')
    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | jq '.' | jq --arg activationDocumentMrid $activationDocumentMrid '. + {activationDocumentMrid: $activationDocumentMrid}')

    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | jq '.' | jq --argjson registeredResourceMrid $registeredResourceMrid '. + {registeredResourceMrid: $registeredResourceMrid}')
    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | jq '.' | jq --arg quantity $quantity '. + {quantity: $quantity}')
    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | jq '.' | jq --argjson senderMarketParticipantMrid $senderMarketParticipantMrid '. + {senderMarketParticipantMrid: $senderMarketParticipantMrid}')
    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | jq '.' | jq --argjson receiverMarketParticipantMrid $receiverMarketParticipantMrid '. + {receiverMarketParticipantMrid: $receiverMarketParticipantMrid}')
    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | jq '.' | jq --argjson createdDateTime $createdDateTime '. + {createdDateTime: $createdDateTime}')
    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | jq '.' | jq --argjson timeInterval $timeInterval '. + {timeInterval: $timeInterval}')

    ENEDIS_ENERGYAMOUNT_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_VALUE | sed "s/\\\\\"/\"/g")
    ENEDIS_ENERGYAMOUNT_VALUE=${ENEDIS_ENERGYAMOUNT_VALUE//[$'\t\r\n ']}

    ENEDIS_ENERGYAMOUNT_LIST_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_LIST_VALUE | jq --argjson indextable $indextable --argjson ELEMENT_VALUE $ENEDIS_ENERGYAMOUNT_VALUE '.[$indextable] |= . + $ELEMENT_VALUE' )

    indextable=$(($indextable+1))
done;

ENEDIS_ENERGYAMOUNT_LIST_VALUE=$(echo $ENEDIS_ENERGYAMOUNT_LIST_VALUE | sed "s/\"/\\\\\"/g")
ENEDIS_ENERGYAMOUNT_LIST_VALUE=${ENEDIS_ENERGYAMOUNT_LIST_VALUE//[$'\t\r\n ']}

if $ONLINE_MODE
then
    kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
            -c '{"Args":["CreateDSOEnergyAmountList","'$ENEDIS_ENERGYAMOUNT_LIST_VALUE'"]}'
fi



echo ""
echo "End of invoke command"
echo "***************************************"
