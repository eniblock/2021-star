#!/bin/bash

ONLINE_MODE=true

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS


echo "***************************************"
echo "Start of invoke command"
echo ""

IdListRESERVEBID_ENEDIS=()
IdListRESERVEBID_RTE=()

VALIDATED="VALIDATED"
REFUSED="REFUSED"

echo "***********************************"
echo
echo "** RTE - RESERVE BID DATA UPDATE"
echo




echo "***********************************"
echo
echo "** ENEDIS - RESERVE BID DATA UPDATE"
echo


ENEDIS_SITES=$(csvtojson < $DATA_PATH/01-MasterData/03-enedis-Site.csv --delimiter=';')
ENEDIS_SITES_NB=$(echo $ENEDIS_SITES | jq 'length')

for i in `seq $ENEDIS_SITES_NB`
do
    index=$(($i-1))
    tabindex=$(echo ".[$index]")
    ENEDIS_SITES_VALUE=$(echo $ENEDIS_SITES | jq $tabindex)
    METERING_POINT_MRID_VALUE=$(echo $ENEDIS_SITES_VALUE | jq '.meteringPointMrid')
    METERING_POINT_MRID_VALUE=$(echo $METERING_POINT_MRID_VALUE | sed "s/\"//g")
    echo "Site: "$METERING_POINT_MRID_VALUE

    if $ONLINE_MODE
    then
        RESERVEBID_ENEDIS=$(
            kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                peer chaincode invoke \
                    -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                    --tls $ENEDIS_TLSOPT \
                    -c '{"Args":["GetReserveBidMarketDocumentBySite","'$METERING_POINT_MRID_VALUE'"]}' 2>&1)

        RESERVEBID_ENEDIS=$(echo $RESERVEBID_ENEDIS | grep -o -P '(?<=").*(?=")')
        RESERVEBID_ENEDIS=$(printf "%b" $RESERVEBID_ENEDIS)
        RESERVEBID_ENEDIS=$(echo $RESERVEBID_ENEDIS | sed "s/\\\\\"/\"/g")

        RESERVEBID_ENEDIS_LIST_NB=$(echo $RESERVEBID_ENEDIS | jq 'length')

        for i in `seq $RESERVEBID_ENEDIS_LIST_NB`
        do
            index=$(($i-1))
            tabindex=$(echo ".[$index]")
            RESERVEBID_ENEDIS_VALUE=$(echo $RESERVEBID_ENEDIS | jq $tabindex)
            RESERVEBID_ENEDIS_VALUE_MRID=$(echo $RESERVEBID_ENEDIS_VALUE | jq '.reserveBidMrid')
            RESERVEBID_ENEDIS_VALUE_STATUS=$(echo $RESERVEBID_ENEDIS_VALUE | jq '.reserveBidStatus')

            if [ $RESERVEBID_ENEDIS_VALUE_STATUS = "\"\"" ]; then
                echo "ReserveBid : "$RESERVEBID_ENEDIS_VALUE_MRID
                IdListRESERVEBID_ENEDIS+=( $RESERVEBID_ENEDIS_VALUE_MRID )

                kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                    peer chaincode invoke \
                        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                        --tls $ENEDIS_TLSOPT \
                        -c '{"Args":["UpdateStatusReserveBidMarketDocument",'$RESERVEBID_ENEDIS_VALUE_MRID',"'$VALIDATED'"]}'


            fi

            echo

        done
    fi

done



echo
echo "wait $PAUSE_TIME"
sleep $PAUSE_TIME

echo
echo "** ENEDIS - BALANCING DATA UPDATE PROCESS"
echo

for RESERVEBID_ENEDIS_VALUE_MRID in ${IdListRESERVEBID_ENEDIS[@]}; do
    echo "ReserveBid : "$RESERVEBID_ENEDIS_VALUE_MRID

    UPDATE_ENEDIS=$(
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT \
                -c '{"Args":["GetBalancingDocumentState",'$RESERVEBID_ENEDIS_VALUE_MRID']}' 2>&1)

    UPDATE_ENEDIS=$(echo $UPDATE_ENEDIS | grep -o -P '(?<=").*(?=")')
    UPDATE_ENEDIS=$(printf "%b" $UPDATE_ENEDIS)

    OUTPUT_ENEDIS_TOPRINT=$(echo $UPDATE_ENEDIS | sed "s/\\\\\"/\"/g")

    echo
    echo $OUTPUT_ENEDIS_TOPRINT
    echo
    echo "Update Process"

    kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT \
                -c '{"Args":["UpdateBalancingDocumentByOrders","'$UPDATE_ENEDIS'"]}'

done



echo ""
echo "End of invoke command"
echo "***************************************"
