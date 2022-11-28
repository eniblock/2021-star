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
#             "reserveBidStatus": ""
#          }
#       ]
#    }
# }

VALIDATED="VALIDATED"
REFUSED="REFUSED"

ENEDIS_LIST_VALIDATED="Bid_PRM_SITE_ENEDIS_AD_1_5110753790
Bid_PRM_SITE_ENEDIS_AD_1_9586812679
Bid_PRM_SITE_ENEDIS_AD_2_3038294967
Bid_PRM_SITE_ENEDIS_AD_2_7533575126
Bid_PRM_SITE_ENEDIS_AD_3_4156661593
Bid_PRM_SITE_ENEDIS_AD_3_9489539804
Bid_PRM_SITE_ENEDIS_AD_4_8259914240
Bid_PRM_SITE_ENEDIS_AD_4_9272834647"

ENEDIS_LIST_REFUSED="Bid_PRM_SITE_ENEDIS_AD_3_3227157158"

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

        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT \
                -c '{"Args":["UpdateStatusReserveBidMarketDocument","'$ID'","'$VALIDATED'"]}'
    done
fi


# if $ONLINE_MODE
# then
#     for ID in $ENEDIS_LIST_REFUSED
#     do
#         echo $ID

#         kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#             peer chaincode invoke \
#                 -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#                 --tls $ENEDIS_TLSOPT \
#                 -c '{"Args":["UpdateStatusReserveBidMarketDocument","'$ID'","'$REFUSED'"]}'
#     done
# fi




echo ""
echo "End of invoke command"
echo "***************************************"
