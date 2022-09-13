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

Clean(){
    local input=$1
    local input=$(echo $input | sed "s/\"//g")
    local input=$(echo $input | sed "s/\://g")
    local input=$(echo $input | sed "s/-//g")
    local input=$(echo $input | sed "s/T//g")
    local input=$(echo $input | sed "s/Z//g")
    local input=$(echo $input | sed "s/null//g")
    echo $input
}

GetMapDateKey(){
    local ACTIVATIONDOCCUMENTS_VALUE=$1
    local ACTIVATIONDOCCUMENTS_START=$(echo $ACTIVATIONDOCCUMENTS_VALUE | jq '.startCreatedDateTime')
    local ACTIVATIONDOCCUMENTS_END=$(echo $ACTIVATIONDOCCUMENTS_VALUE | jq '.endCreatedDateTime')
    local ID=$(echo $ACTIVATIONDOCCUMENTS_START"99"$ACTIVATIONDOCCUMENTS_END)
    echo $(Clean $ID)
}


echo "***************************************"
echo "Start of invoke command"
echo ""



IdListRTE_PRODUCER=()
IdListRTE_ENEDIS=()
IdListENEDIS=()
declare -A mapRTE_ACTIVATIONDOCUMENTS
declare -A mapENEDIS_ACTIVATIONDOCUMENTS

# echo "***********************************"
# echo
# echo "** RTE to PRODUCER - ACTIVATION DOCUMENTS DATA CREATION START"
# echo

# RTE_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/21-rte-OrdreLimitation-rte-start.json | jq '.')
# RTE_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq 'length')
# RTE_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

# for i in `seq $RTE_ACTIVATIONDOCUMENT_VALUE_NB`
# do
#     index=$(($i-1))
#     activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
#     activationDocumentMrid=$(echo "activationDocument_rte_$activationDocumentMrid")
#     IdListRTE_PRODUCER+=( $activationDocumentMrid )
#     ELEMENT_VALUE=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
#     ELEMENT_VALUE=${ELEMENT_VALUE//[$'\t\r\n ']}
#     ID_ELEMENT_VALUE=$(GetMapDateKey $ELEMENT_VALUE)
#     mapRTE_ACTIVATIONDOCUMENTS["$ID_ELEMENT_VALUE"]=$activationDocumentMrid
#     RTE_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
# done
# RTE_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
# RTE_ACTIVATIONDOCUMENT_VALUE_STR=${RTE_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

# if $ONLINE_MODE
# then
#     kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#         peer chaincode invoke \
#             -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#             --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
#             -c '{"Args":["CreateActivationDocumentList","'$RTE_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
# fi



# echo "***********************************"
# echo
# echo "** RTE to PRODUCER - ACTIVATION DOCUMENTS DATA CREATION END"
# echo

# RTE_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/22-rte-OrdreLimitation-rte-end.json | jq '.')
# RTE_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq 'length')
# RTE_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

# for i in `seq $RTE_ACTIVATIONDOCUMENT_VALUE_NB`
# do
#     index=$(($i-1))
#     activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
#     activationDocumentMrid=$(echo "activationDocument_rte_$activationDocumentMrid")
#     IdListRTE_PRODUCER+=( $activationDocumentMrid )
#     ELEMENT_VALUE=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
#     ELEMENT_VALUE=${ELEMENT_VALUE//[$'\t\r\n ']}
#     ID_ELEMENT_VALUE=$(GetMapDateKey $ELEMENT_VALUE)
#     mapRTE_ACTIVATIONDOCUMENTS["$ID_ELEMENT_VALUE"]=$activationDocumentMrid
#     RTE_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
# done
# RTE_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
# RTE_ACTIVATIONDOCUMENT_VALUE_STR=${RTE_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

# if $ONLINE_MODE
# then
#     kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#         peer chaincode invoke \
#             -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#             --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
#             -c '{"Args":["CreateActivationDocumentList","'$RTE_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
# fi




echo "***********************************"
echo
echo "** RTE to ENEDIS - ACTIVATION DOCUMENTS DATA CREATION START"
echo

RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/25-rte-OrdreLimitation-enedis-start_100.json | jq '.')
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq 'length')
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

for i in `seq $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB`
do
    index=$(($i-1))
    activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    activationDocumentMrid=$(echo "activationDocument_rte_$activationDocumentMrid")
    IdListRTE_ENEDIS+=( $activationDocumentMrid )
    ELEMENT_VALUE=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
    RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
done
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=${RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

echo "--- process start $(date +"%T.%3N") ---"


if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $ENEDIS_TLSOPT $RTE_TLSOPT \
            -c '{"Args":["CreateActivationDocumentList","'$RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
fi


echo "--- process end   $(date +"%T.%3N") ---"



# echo "***********************************"
# echo
# echo "** RTE to ENEDIS - ACTIVATION DOCUMENTS DATA CREATION COUPLE"
# echo

# RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/24-rte-OrdreLimitation-enedis-couple.json | jq '.')
# RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq 'length')
# RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

# for i in `seq $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB`
# do
#     index=$(($i-1))
#     activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
#     activationDocumentMrid=$(echo "activationDocument_rte_$activationDocumentMrid")
#     IdListRTE_ENEDIS+=( $activationDocumentMrid )
#     ELEMENT_VALUE=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
#     RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
# done
# RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
# RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=${RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

# if $ONLINE_MODE
# then
#     kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#         peer chaincode invoke \
#             -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#             --tls $ENEDIS_TLSOPT $RTE_TLSOPT \
#             -c '{"Args":["CreateActivationDocumentList","'$RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
# fi



# echo "***********************************"
# echo
# echo "** ENEDIS - ACTIVATION DOCUMENTS DATA CREATION"
# echo

# ENEDIS_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/31-enedis-OrdreLimitation-couple.json | jq '.')
# ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq 'length')
# ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

# for i in `seq $ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB`
# do
#     index=$(($i-1))
#     activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
#     activationDocumentMrid=$(echo "activationDocument_enedis_$activationDocumentMrid")
#     IdListENEDIS+=( $activationDocumentMrid )
#     ELEMENT_VALUE=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
#     ELEMENT_VALUE=${ELEMENT_VALUE//[$'\t\r\n ']}
#     ID_ELEMENT_VALUE=$(GetMapDateKey $ELEMENT_VALUE)
#     mapENEDIS_ACTIVATIONDOCUMENTS["$ID_ELEMENT_VALUE"]=$activationDocumentMrid
#     ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
# done
# ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
# ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=${ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

# if $ONLINE_MODE
# then
#     kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#         peer chaincode invoke \
#             -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#             --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
#             -c '{"Args":["CreateActivationDocumentList","'$ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
# fi




# echo
# echo "wait $PAUSE_TIME"
# sleep $PAUSE_TIME



# echo "***********************************"
# echo
# echo "** RTE to PRODUCER - CHANGING ELIGIBILITY STATUS"
# echo

# index=0
# for id in ${IdListRTE_PRODUCER[@]}
# do
#     index=$(expr $index + 1)
#     rank=$(expr $index % 2)
#     if [ $rank -eq 1 ]
#     then
#         ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/41-EligibilityStatusOUI.json | jq '.')
#     else
#         ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/42-EligibilityStatusNON.json | jq '.')
#     fi
#     ELIGIBILITYSTATUS_VALUE_WITHID=$(echo $ELIGIBILITYSTATUS_VALUE | jq --arg id $id '. + {activationDocumentMrid: $id}')
#     ELIGIBILITYSTATUS_VALUE_STR=$(echo $ELIGIBILITYSTATUS_VALUE_WITHID | sed "s/\"/\\\\\"/g")
#     ELIGIBILITYSTATUS_VALUE_STR=${ELIGIBILITYSTATUS_VALUE_STR//[$'\t\r\n ']}

#     if $ONLINE_MODE
#     then
#         kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#             peer chaincode invoke \
#                 -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#                 --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
#                 -c '{"Args":["UpdateActivationDocumentEligibilityStatus","'$ELIGIBILITYSTATUS_VALUE_STR'"]}'
#     fi
# done


# echo "***********************************"
# echo
# echo "** RTE to ENEDIS - CHANGING ELIGIBILITY STATUS"
# echo

# index=0
# for id in ${IdListRTE_ENEDIS[@]}
# do
#     index=$(expr $index + 1)
#     rank=$(expr $index % 2)
#     if [ $rank -eq 1 ]
#     then
#         ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/41-EligibilityStatusOUI.json | jq '.')
#     else
#         ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/42-EligibilityStatusNON.json | jq '.')
#     fi
#     ELIGIBILITYSTATUS_VALUE_WITHID=$(echo $ELIGIBILITYSTATUS_VALUE | jq --arg id $id '. + {activationDocumentMrid: $id}')
#     ELIGIBILITYSTATUS_VALUE_STR=$(echo $ELIGIBILITYSTATUS_VALUE_WITHID | sed "s/\"/\\\\\"/g")
#     ELIGIBILITYSTATUS_VALUE_STR=${ELIGIBILITYSTATUS_VALUE_STR//[$'\t\r\n ']}

#     if $ONLINE_MODE
#     then
#         kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#             peer chaincode invoke \
#                 -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#                 --tls $ENEDIS_TLSOPT $RTE_TLSOPT \
#                 -c '{"Args":["UpdateActivationDocumentEligibilityStatus","'$ELIGIBILITYSTATUS_VALUE_STR'"]}'
#     fi
# done



# echo "***********************************"
# echo
# echo "** ENEDIS - ENERGY AMOUNT CREATION"
# echo

# ENEDIS_ENERGYAMOUNTS=$(cat $DATA_PATH/03-ActivationDocuments/61-HTA-EnergyAmount.json | jq '.')
# ENEDIS_ENERGYAMOUNTS_NB=$(echo $ENEDIS_ENERGYAMOUNTS | jq 'length')

# for i in `seq $ENEDIS_ENERGYAMOUNTS_NB`
# do
#     tabindex=$(echo ".["$i-1"]")
#     energyAmountMarketDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
#     energyAmountMarketDocumentMrid=$(echo "energyAmount_enedis_$energyAmountMarketDocumentMrid")
#     ENEDIS_ENERGYAMOUNTS_VALUE=$(echo $ENEDIS_ENERGYAMOUNTS | jq $tabindex | jq --arg value $energyAmountMarketDocumentMrid '. + {energyAmountMarketDocumentMrid: $value}')
#     timeINTERVAL=$(echo $ENEDIS_ENERGYAMOUNTS_VALUE | jq '.timeInterval')
#     timeINTERVAL=$(echo $timeINTERVAL | sed "s/\//99/g")
#     key=$(Clean $timeINTERVAL)
#     activationDocumentMrid=${mapENEDIS_ACTIVATIONDOCUMENTS[$key]}
#     ENEDIS_ENERGYAMOUNTS_VALUE=$(echo $ENEDIS_ENERGYAMOUNTS_VALUE | jq --arg value $activationDocumentMrid '. + {activationDocumentMrid: $value}')

#     ENEDIS_ENERGYAMOUNTS_VALUE_STR=$(echo $ENEDIS_ENERGYAMOUNTS_VALUE | sed "s/\"/\\\\\"/g")
#     ENEDIS_ENERGYAMOUNTS_VALUE_STR=${ENEDIS_ENERGYAMOUNTS_VALUE_STR//[$'\t\r\n ']}

#     echo
#     echo
#     echo "CREATION $ENEDIS_NODE Energy Account : $ENEDIS_ENERGYAMOUNTS_VALUE_STR"
#     echo

#     if $ONLINE_MODE
#     then
#         kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#             peer chaincode invoke \
#                 -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#                 --tls $ENEDIS_TLSOPT \
#                 -c '{"Args":["CreateDSOEnergyAmount","'$ENEDIS_ENERGYAMOUNTS_VALUE_STR'"]}'
#     fi

# done


# echo "***********************************"
# echo
# echo "** RTE - ENERGY AMOUNT CREATION"
# echo

# RTE_ENERGYAMOUNTS=$(cat $DATA_PATH/03-ActivationDocuments/62-HTB-EnergyAmount.json | jq '.')
# RTE_ENERGYAMOUNTS_NB=$(echo $RTE_ENERGYAMOUNTS | jq 'length')


# for i in `seq $RTE_ENERGYAMOUNTS_NB`
# do
#     tabindex=$(echo ".["$i-1"]")
#     energyAmountMarketDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
#     energyAmountMarketDocumentMrid=$(echo "energyAmount_rte_$energyAmountMarketDocumentMrid")
#     RTE_ENERGYAMOUNTS_VALUE=$(echo $RTE_ENERGYAMOUNTS | jq $tabindex | jq --arg value $energyAmountMarketDocumentMrid '. + {energyAmountMarketDocumentMrid: $value}')
#     timeINTERVAL=$(echo $RTE_ENERGYAMOUNTS_VALUE | jq '.timeInterval')
#     timeINTERVAL=$(echo $timeINTERVAL | sed "s/\//99/g")
#     key=$(Clean $timeINTERVAL)
#     activationDocumentMrid=${mapRTE_ACTIVATIONDOCUMENTS[$key]}
#     RTE_ENERGYAMOUNTS_VALUE=$(echo $RTE_ENERGYAMOUNTS_VALUE | jq --arg value $activationDocumentMrid '. + {activationDocumentMrid: $value}')

#     RTE_ENERGYAMOUNTS_VALUE_STR=$(echo $RTE_ENERGYAMOUNTS_VALUE | sed "s/\"/\\\\\"/g")
#     RTE_ENERGYAMOUNTS_VALUE_STR=${RTE_ENERGYAMOUNTS_VALUE_STR//[$'\t\r\n ']}
#     echo $RTE_ENERGYAMOUNTS_VALUE_STR

#     echo
#     echo
#     echo "CREATION $RTE_NODE Energy Account : $RTE_ENERGYAMOUNTS_VALUE_STR"
#     echo

#     if $ONLINE_MODE
#     then
#         kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#             peer chaincode invoke \
#                 -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#                 --tls $RTE_TLSOPT \
#                 -c '{"Args":["CreateTSOEnergyAmount","'$RTE_ENERGYAMOUNTS_VALUE_STR'"]}'
#     fi

# done



echo ""
echo "End of invoke command"
echo "***************************************"
