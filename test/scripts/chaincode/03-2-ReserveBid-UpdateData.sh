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

ENEDIS_LIST_VALIDATED="Bid_PRM_SITE_ENEDIS_AD_1_1576926537
Bid_PRM_SITE_ENEDIS_AD_1_9960644006
Bid_PRM_SITE_ENEDIS_AD_2_7781639566
Bid_PRM_SITE_ENEDIS_AD_2_9240901180
Bid_PRM_SITE_ENEDIS_AD_3_4626120187
Bid_PRM_SITE_ENEDIS_AD_3_7553411743
Bid_PRM_SITE_ENEDIS_AD_4_0135680689
Bid_PRM_SITE_ENEDIS_AD_4_6003496490"

ENEDIS_LIST_REFUSED="Bid_PRM_SITE_ENEDIS_AD_2_7781639566"

echo "***********************************"
echo
echo "** RTE - RESERVE BID DATA UPDATE"
echo




echo "***********************************"
echo
echo "** ENEDIS - RESERVE BID DATA UPDATE"
echo


# if $ONLINE_MODE
# then
#     for ID in $ENEDIS_LIST_VALIDATED
#     do
#         echo $ID

#         kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#             peer chaincode invoke \
#                 -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
#                 --tls $ENEDIS_TLSOPT \
#                 -c '{"Args":["UpdateStatusReserveBidMarketDocument","'$ID'","'$VALIDATED'"]}'
#     done
# fi


if $ONLINE_MODE
then
    for ID in $ENEDIS_LIST_REFUSED
    do
        echo $ID

        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
            peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                --tls $ENEDIS_TLSOPT \
                -c '{"Args":["UpdateStatusReserveBidMarketDocument","'$ID'","'$REFUSED'"]}'
    done
fi




echo ""
echo "End of invoke command"
echo "***************************************"
