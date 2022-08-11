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
echo "** RTE - PRODUCER DATA CREATION"
echo

RTE_PRODUCERS=$(csvtojson < $DATA_PATH/11-rte-Producer.csv --delimiter=';')
RTE_PRODUCERS_NB=$(echo $RTE_PRODUCERS | jq 'length')

for i in `seq $RTE_PRODUCERS_NB`
do
    tabindex=$(echo ".["$i-1"]")
    RTE_PRODUCERS_VALUE=$(echo $RTE_PRODUCERS | jq $tabindex)
    RTE_PRODUCERS_VALUE_STR=$(echo $RTE_PRODUCERS_VALUE | sed "s/\"/\\\\\"/g")
    RTE_PRODUCERS_VALUE_STR=${RTE_PRODUCERS_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $RTE_NODE Producer : $RTE_PRODUCERS_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["CreateProducer","'$RTE_PRODUCERS_VALUE_STR'"]}'
    fi

done

echo "***********************************"
echo
echo "** ENEDIS - PRODUCER DATA CREATION"
echo

ENEDIS_PRODUCERS=$(csvtojson < $DATA_PATH/01-enedis-Producer.csv --delimiter=';')
ENEDIS_PRODUCERS_NB=$(echo $ENEDIS_PRODUCERS | jq 'length')

for i in `seq $ENEDIS_PRODUCERS_NB`
do
    tabindex=$(echo ".["$i-1"]")
    ENEDIS_PRODUCERS_VALUE=$(echo $ENEDIS_PRODUCERS | jq $tabindex)
    ENEDIS_PRODUCERS_VALUE_STR=$(echo $ENEDIS_PRODUCERS_VALUE | sed "s/\"/\\\\\"/g")
    ENEDIS_PRODUCERS_VALUE_STR=${ENEDIS_PRODUCERS_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $ENEDIS_NODE Producer : $ENEDIS_PRODUCERS_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["CreateProducer","'$ENEDIS_PRODUCERS_VALUE_STR'"]}'
    fi
done

echo "***********************************"
echo
echo "** RTE - SYSTEMOPERATOR DATA CREATION"
echo

RTE_SYSTEMOPERATORS=$(csvtojson < $DATA_PATH/12-rte-MarketParticipants.csv --delimiter=';')
RTE_SYSTEMOPERATORS_NB=$(echo $RTE_SYSTEMOPERATORS | jq 'length')

for i in `seq $RTE_SYSTEMOPERATORS_NB`
do
    tabindex=$(echo ".["$i-1"]")
    RTE_SYSTEMOPERATORS_VALUE=$(echo $RTE_SYSTEMOPERATORS | jq $tabindex)
    RTE_SYSTEMOPERATORS_VALUE_STR=$(echo $RTE_SYSTEMOPERATORS_VALUE | sed "s/\"/\\\\\"/g")
    RTE_SYSTEMOPERATORS_VALUE_STR=${RTE_SYSTEMOPERATORS_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $RTE_NODE System Operator : $RTE_SYSTEMOPERATORS_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["CreateSystemOperator","'$RTE_SYSTEMOPERATORS_VALUE_STR'"]}'
    fi
done

echo "***********************************"
echo
echo "** ENEDIS - SYSTEMOPERATOR DATA CREATION"
echo

ENEDIS_SYSTEMOPERATORS=$(csvtojson < $DATA_PATH/02-enedis-MarketParticipants.csv --delimiter=';')
ENEDIS_SYSTEMOPERATORS_NB=$(echo $ENEDIS_SYSTEMOPERATORS | jq 'length')

for i in `seq $ENEDIS_SYSTEMOPERATORS_NB`
do
    tabindex=$(echo ".["$i-1"]")
    ENEDIS_SYSTEMOPERATORS_VALUE=$(echo $ENEDIS_SYSTEMOPERATORS | jq $tabindex)
    ENEDIS_SYSTEMOPERATORS_VALUE_STR=$(echo $ENEDIS_SYSTEMOPERATORS_VALUE | sed "s/\"/\\\\\"/g")
    ENEDIS_SYSTEMOPERATORS_VALUE_STR=${ENEDIS_SYSTEMOPERATORS_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $ENEDIS_NODE System Operator : $ENEDIS_SYSTEMOPERATORS_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["CreateSystemOperator","'$ENEDIS_SYSTEMOPERATORS_VALUE_STR'"]}'
    fi

done




echo
echo "wait $PAUSE_TIME"
sleep $PAUSE_TIME






echo "***********************************"
echo
echo "** RTE - SITE DATA CREATION"
echo

RTE_SITES=$(csvtojson < $DATA_PATH/13-rte-Site.csv --delimiter=';')
RTE_SITES_NB=$(echo $RTE_SITES | jq 'length')

for i in `seq $RTE_SITES_NB`
do
    tabindex=$(echo ".["$i-1"]")
    RTE_SITES_VALUE=$(echo $RTE_SITES | jq $tabindex)
    RTE_SITES_VALUE_STR=$(echo $RTE_SITES_VALUE | sed "s/\"/\\\\\"/g")
    RTE_SITES_VALUE_STR=${RTE_SITES_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $RTE_NODE Site : $RTE_SITES_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["CreateSite","'$RTE_SITES_VALUE_STR'"]}'
    fi

done

echo "***********************************"
echo
echo "** ENEDIS - SITE DATA CREATION"
echo

ENEDIS_SITES=$(csvtojson < $DATA_PATH/03-enedis-Site.csv --delimiter=';')
ENEDIS_SITES_NB=$(echo $ENEDIS_SITES | jq 'length')

for i in `seq $ENEDIS_SITES_NB`
do
    tabindex=$(echo ".["$i-1"]")
    ENEDIS_SITES_VALUE=$(echo $ENEDIS_SITES | jq $tabindex)
    ENEDIS_SITES_VALUE_STR=$(echo $ENEDIS_SITES_VALUE | sed "s/\"/\\\\\"/g")
    ENEDIS_SITES_VALUE_STR=${ENEDIS_SITES_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $ENEDIS_NODE Site : $ENEDIS_SITES_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["CreateSite","'$ENEDIS_SITES_VALUE_STR'"]}'
    fi

done




echo
echo "wait $PAUSE_TIME"
sleep $PAUSE_TIME






echo "***********************************"
echo
echo "** RTE - YELLOWPAGE DATA CREATION"
echo

RTE_YELLOWPAGES=$(csvtojson < $DATA_PATH/14-rte-YellowPages.csv --delimiter=';')
RTE_YELLOWPAGES_NB=$(echo $RTE_YELLOWPAGES | jq 'length')

for i in `seq $RTE_YELLOWPAGES_NB`
do
    tabindex=$(echo ".["$i-1"]")
    yellowPageMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    RTE_YELLOWPAGES_VALUE=$(echo $RTE_YELLOWPAGES | jq $tabindex | jq --arg value $yellowPageMrid '. + {yellowPageMrid: $value}')
    RTE_YELLOWPAGES_VALUE_STR=$(echo $RTE_YELLOWPAGES_VALUE | sed "s/\"/\\\\\"/g")
    RTE_YELLOWPAGES_VALUE_STR=${RTE_YELLOWPAGES_VALUE_STR//[$'\t\r\n ']}

    echo
    echo
    echo "CREATION $RTE_NODE YellowPages : $RTE_YELLOWPAGES_VALUE_STR"
    echo

    if $ONLINE_MODE
    then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT $RTE_TLSOPT \
                -c '{"Args":["CreateYellowPages","'$RTE_YELLOWPAGES_VALUE_STR'"]}'
    fi

done




echo
echo "wait $PAUSE_TIME"
sleep $PAUSE_TIME




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


echo "***********************************"
echo
echo "** ENEDIS - CHANGING ELIGIBILITY STATUS"
echo

index=0
for id in ${IdListENEDIS[@]}
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
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
                -c '{"Args":["UpdateActivationDocumentEligibilityStatus","'$ELIGIBILITYSTATUS_VALUE_STR'"]}'
    fi
done


echo ""
echo "End of invoke command"
echo "***************************************"
