#!/bin/bash

ONLINE_MODE=true

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS


echo "***************************************"
echo "Start of invoke command"
echo ""

# {
#    "fields": [
#       "reserveBidMrid"
#    ],
#    "selector": {
#       "$and": [
#          {
#             "docType": {
#                "$eq": "reserveBidMarketDocument"
#             }
#          },
#          {
#             "meteringPointMrid": {
#                "$in": [
#                   "PRM_SITE_ENEDIS_AD_1",
#                   "PRM_SITE_ENEDIS_AD_2",
#                   "PRM_SITE_ENEDIS_AD_3",
#                   "PRM_SITE_ENEDIS_AD_4"
#                ]
#             }
#          },
#          {
#             "validityPeriodStartDateTime": {
#                "$gte": "2020-01-01T00:00:00Z"
#             }
#          }
#       ]
#    }
# }

ENEDIS_LIST_VALIDATED="Bid_PRM_SITE_ENEDIS_AD_1_5110753790
Bid_PRM_SITE_ENEDIS_AD_1_9586812679
Bid_PRM_SITE_ENEDIS_AD_2_3038294967
Bid_PRM_SITE_ENEDIS_AD_2_7533575126
Bid_PRM_SITE_ENEDIS_AD_3_4156661593
Bid_PRM_SITE_ENEDIS_AD_3_9489539804
Bid_PRM_SITE_ENEDIS_AD_4_8259914240
Bid_PRM_SITE_ENEDIS_AD_4_9272834647"


echo "***********************************"
echo
echo "** RTE - RESERVE BID DATA UPDATE"
echo




echo "***********************************"
echo
echo "** ENEDIS - RESERVE BID DATA UPDATE"
echo


if $ONLINE_MODE
then
    for ID in $ENEDIS_LIST_VALIDATED
    do
        echo $ID

        UPDATE_ENEDIS=$(
            kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                peer chaincode invoke \
                    -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                    --tls $ENEDIS_TLSOPT \
                    -c '{"Args":["GetBalancingDocumentState","'$ID'"]}' 2>&1)

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

        echo
        echo "End Update Process $ID"
        echo

    done
fi




echo ""
echo "End of invoke command"
echo "***************************************"
