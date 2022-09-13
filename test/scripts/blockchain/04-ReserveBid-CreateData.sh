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
echo "** RTE - RESERVE BID DATA CREATION"
echo

RTE_RESERVE_BID=$(cat $DATA_PATH/04-ReserveBid/72-HTB-ReserveBid.json | jq '.')
RTE_SITES=$(csvtojson < $DATA_PATH/01-MasterData/13-rte-Site.csv --delimiter=';')
RTE_SITES_NB=$(echo $RTE_SITES | jq 'length')

RTE_RESERVE_BID_LIST_VALUE=$(echo "[]" | jq '.')

for i in `seq $RTE_SITES_NB`
do
    index=$(($i-1))
    tabindex=$(echo ".[$index]")
    RTE_SITES_VALUE=$(echo $RTE_SITES | jq $tabindex)
    METERING_POINT_MRID_VALUE=$(echo $RTE_SITES_VALUE | jq '.meteringPointMrid')
    SENDER_MARKET_PARTICIPANT_MRID_VALUE=$(echo $RTE_SITES_VALUE | jq '.producerMarketParticipantMrid')
    RECEIVER_MARKET_PARTICIPANT_MRID_VALUE=$(echo $RTE_SITES_VALUE | jq '.systemOperatorMarketParticipantMrid')
    reserveBidMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    reserveBidMrid=$(echo "reserveBidMrid_rte_$reserveBidMrid")

    RTE_RESERVE_BID_VALUE=$(echo $RTE_RESERVE_BID | jq '.' | jq --arg reserveBidMrid $reserveBidMrid --argjson meteringPointMrid $METERING_POINT_MRID_VALUE --argjson senderMarketParticipantMrid $SENDER_MARKET_PARTICIPANT_MRID_VALUE --argjson receiverMarketParticipantMrid $RECEIVER_MARKET_PARTICIPANT_MRID_VALUE '. + {reserveBidMrid: $reserveBidMrid, meteringPointMrid: $meteringPointMrid, senderMarketParticipantMrid: $senderMarketParticipantMrid, receiverMarketParticipantMrid: $receiverMarketParticipantMrid}')
    RTE_RESERVE_BID_VALUE=${RTE_RESERVE_BID_VALUE//[$'\t\r\n ']}
    RTE_RESERVE_BID_LIST_VALUE=$(echo $RTE_RESERVE_BID_LIST_VALUE | jq --argjson index $index --argjson ELEMENT_VALUE $RTE_RESERVE_BID_VALUE '.[$index] |= . + $ELEMENT_VALUE' )
done
RTE_RESERVE_BID_LIST_VALUE_STR=$(echo $RTE_RESERVE_BID_LIST_VALUE | sed "s/\"/\\\\\"/g")
RTE_RESERVE_BID_LIST_VALUE_STR=${RTE_RESERVE_BID_LIST_VALUE_STR//[$'\t\r\n ']}

if $ONLINE_MODE
then
    kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $PRODUCER_TLSOPT $RTE_TLSOPT \
            -c '{"Args":["CreateReserveBidMarketDocumentList","'$RTE_RESERVE_BID_LIST_VALUE_STR'"]}'
fi


echo "***********************************"
echo
echo "** ENEDIS - RESERVE BID DATA CREATION"
echo

ENEDIS_RESERVE_BID=$(cat $DATA_PATH/04-ReserveBid/71-HTA-ReserveBid.json | jq '.')
ENEDIS_SITES=$(csvtojson < $DATA_PATH/01-MasterData/03-enedis-Site.csv --delimiter=';')
ENEDIS_SITES_NB=$(echo $ENEDIS_SITES | jq 'length')

ENEDIS_RESERVE_BID_LIST_VALUE=$(echo "[]" | jq '.')

for i in `seq $ENEDIS_SITES_NB`
do
    index=$(($i-1))
    tabindex=$(echo ".[$index]")
    ENEDIS_SITES_VALUE=$(echo $ENEDIS_SITES | jq $tabindex)
    METERING_POINT_MRID_VALUE=$(echo $ENEDIS_SITES_VALUE | jq '.meteringPointMrid')
    SENDER_MARKET_PARTICIPANT_MRID_VALUE=$(echo $ENEDIS_SITES_VALUE | jq '.producerMarketParticipantMrid')
    RECEIVER_MARKET_PARTICIPANT_MRID_VALUE=$(echo $ENEDIS_SITES_VALUE | jq '.systemOperatorMarketParticipantMrid')
    reserveBidMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    reserveBidMrid=$(echo "reserveBidMrid_enedis_$reserveBidMrid")

    ENEDIS_RESERVE_BID_VALUE=$(echo $ENEDIS_RESERVE_BID | jq '.' | jq --arg reserveBidMrid $reserveBidMrid --argjson meteringPointMrid $METERING_POINT_MRID_VALUE --argjson senderMarketParticipantMrid $SENDER_MARKET_PARTICIPANT_MRID_VALUE --argjson receiverMarketParticipantMrid $RECEIVER_MARKET_PARTICIPANT_MRID_VALUE '. + {reserveBidMrid: $reserveBidMrid, meteringPointMrid: $meteringPointMrid, senderMarketParticipantMrid: $senderMarketParticipantMrid, receiverMarketParticipantMrid: $receiverMarketParticipantMrid}')
    ENEDIS_RESERVE_BID_VALUE=${ENEDIS_RESERVE_BID_VALUE//[$'\t\r\n ']}
    ENEDIS_RESERVE_BID_LIST_VALUE=$(echo $ENEDIS_RESERVE_BID_LIST_VALUE | jq --argjson index $index --argjson ELEMENT_VALUE $ENEDIS_RESERVE_BID_VALUE '.[$index] |= . + $ELEMENT_VALUE' )
done
ENEDIS_RESERVE_BID_LIST_VALUE_STR=$(echo $ENEDIS_RESERVE_BID_LIST_VALUE | sed "s/\"/\\\\\"/g")
ENEDIS_RESERVE_BID_LIST_VALUE_STR=${ENEDIS_RESERVE_BID_LIST_VALUE_STR//[$'\t\r\n ']}

if $ONLINE_MODE
then
    kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
        peer chaincode invoke \
            -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
            --tls $PRODUCER_TLSOPT $ENEDIS_TLSOPT \
            -c '{"Args":["CreateReserveBidMarketDocumentList","'$ENEDIS_RESERVE_BID_LIST_VALUE_STR'"]}'
fi




echo ""
echo "End of invoke command"
echo "***************************************"
