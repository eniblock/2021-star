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
                --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
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
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
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
                --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
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
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
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
                --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
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
                --tls $ENEDIS_TLSOPT $PRODUCER_TLSOPT \
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

RTE_YELLOWPAGES=$(csvtojson < $DATA_PATH/14-YellowPages.csv --delimiter=';')
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


echo ""
echo "End of invoke command"
echo "***************************************"
