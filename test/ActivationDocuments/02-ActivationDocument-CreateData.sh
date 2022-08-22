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



IdListRTE_PRODUCER=()
IdListRTE_ENEDIS=()
IdListENEDIS=()

echo "***********************************"
echo
echo "** RTE to PRODUCER - ACTIVATION DOCUMENTS DATA CREATION"
echo

RTE_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/21-rte-OrdreLimitation-rte.json | jq '.')
RTE_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq 'length')
RTE_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

for i in `seq $RTE_ACTIVATIONDOCUMENT_VALUE_NB`
do
    index=$(($i-1))
    activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    IdListRTE_PRODUCER+=( $activationDocumentMrid )
    ELEMENT_VALUE=$(echo $RTE_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
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


echo "***********************************"
echo
echo "** RTE to ENEDIS - ACTIVATION DOCUMENTS DATA CREATION"
echo

RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/22-rte-OrdreLimitation-enedis.json | jq '.')
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq 'length')
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

for i in `seq $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB`
do
    index=$(($i-1))
    activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    IdListRTE_ENEDIS+=( $activationDocumentMrid )
    ELEMENT_VALUE=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
    RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
done
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=${RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

if $ONLINE_MODE
then
    kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $ENEDIS_TLSOPT $RTE_TLSOPT \
            -c '{"Args":["CreateActivationDocumentList","'$RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR'"]}'
fi

echo "***********************************"
echo
echo "** ENEDIS - ACTIVATION DOCUMENTS DATA CREATION"
echo

ENEDIS_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/31-enedis-OrdreLimitation.json | jq '.')
ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq 'length')
ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')

for i in `seq $ENEDIS_ACTIVATIONDOCUMENT_VALUE_NB`
do
    index=$(($i-1))
    activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    IdListENEDIS+=( $activationDocumentMrid )
    ELEMENT_VALUE=$(echo $ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq --argjson index $index --arg activationDocumentMrid $activationDocumentMrid '.[$index] + {activationDocumentMrid: $activationDocumentMrid}')
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




echo
echo "wait $PAUSE_TIME"
sleep $PAUSE_TIME



echo "***********************************"
echo
echo "** RTE to PRODUCER - CHANGING ELIGIBILITY STATUS"
echo

index=0
for id in ${IdListRTE_PRODUCER[@]}
do
    index=$(expr $index + 1)
    rank=$(expr $index % 2)
    if [ $rank -eq 1 ]
    then
        ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/41-EligibilityStatusOUI.json | jq '.')
    else
        ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/42-EligibilityStatusNON.json | jq '.')
    fi
    ELIGIBILITYSTATUS_VALUE_WITHID=$(echo $ELIGIBILITYSTATUS_VALUE | jq --arg id $id '. + {activationDocumentMrid: $id}')
    ELIGIBILITYSTATUS_VALUE_STR=$(echo $ELIGIBILITYSTATUS_VALUE_WITHID | sed "s/\"/\\\\\"/g")
    ELIGIBILITYSTATUS_VALUE_STR=${ELIGIBILITYSTATUS_VALUE_STR//[$'\t\r\n ']}

    if $ONLINE_MODE
    then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["UpdateActivationDocumentEligibilityStatus","'$ELIGIBILITYSTATUS_VALUE_STR'"]}'
    fi
done


echo "***********************************"
echo
echo "** RTE to ENEDIS - CHANGING ELIGIBILITY STATUS"
echo

index=0
for id in ${IdListRTE_ENEDIS[@]}
do
    index=$(expr $index + 1)
    rank=$(expr $index % 2)
    if [ $rank -eq 1 ]
    then
        ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/41-EligibilityStatusOUI.json | jq '.')
    else
        ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/42-EligibilityStatusNON.json | jq '.')
    fi
    ELIGIBILITYSTATUS_VALUE_WITHID=$(echo $ELIGIBILITYSTATUS_VALUE | jq --arg id $id '. + {activationDocumentMrid: $id}')
    ELIGIBILITYSTATUS_VALUE_STR=$(echo $ELIGIBILITYSTATUS_VALUE_WITHID | sed "s/\"/\\\\\"/g")
    ELIGIBILITYSTATUS_VALUE_STR=${ELIGIBILITYSTATUS_VALUE_STR//[$'\t\r\n ']}

    if $ONLINE_MODE
    then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["UpdateActivationDocumentEligibilityStatus","'$ELIGIBILITYSTATUS_VALUE_STR'"]}'
    fi
done


# echo "***********************************"
# echo
# echo "** ENEDIS - CHANGING ELIGIBILITY STATUS"
# echo

# index=0
# for id in ${IdListENEDIS[@]}
# do
#     index=$(expr $index + 1)
#     rank=$(expr $index % 2)
#     if [ $rank -eq 1 ]
#     then
#         ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/41-EligibilityStatusOUI.json | jq '.')
#     else
#         ELIGIBILITYSTATUS_VALUE=$(cat $DATA_PATH/42-EligibilityStatusNON.json | jq '.')
#     fi
#     ELIGIBILITYSTATUS_VALUE_WITHID=$(echo $ELIGIBILITYSTATUS_VALUE | jq --arg id $id '. + {activationDocumentMrid: $id}')
#     ELIGIBILITYSTATUS_VALUE_STR=$(echo $ELIGIBILITYSTATUS_VALUE_WITHID | sed "s/\"/\\\\\"/g")
#     ELIGIBILITYSTATUS_VALUE_STR=${ELIGIBILITYSTATUS_VALUE_STR//[$'\t\r\n ']}

#     if $ONLINE_MODE
#     then
#         kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#             peer chaincode invoke \
#                 -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#                 --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
#                 -c '{"Args":["UpdateActivationDocumentEligibilityStatus","'$ELIGIBILITYSTATUS_VALUE_STR'"]}'
#     fi
# done


echo ""
echo "End of invoke command"
echo "***************************************"
