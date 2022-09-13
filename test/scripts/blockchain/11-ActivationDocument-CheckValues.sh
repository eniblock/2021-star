#!/bin/bash

ONLINE_MODE=true

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS

echo "***************************************"
echo "Start of invoke command"
echo ""

# echo "***********************************"
# echo
# echo "******** FORMAT EXPECTED VALUES"
# echo

# declare -A mapRTE_PRODUCERS
# declare -A mapENEDIS_PRODUCERS
# declare -A mapENEDIS_SYSTEMOPERATORS
# declare -A mapRTE_SYSTEMOPERATORS
# declare -A mapENEDIS_SITES
# declare -A mapRTE_SITES


# echo
# echo
# echo "***********************************"
# echo
# echo "** ENEDIS - PRODUCER"
# echo

# ENEDIS_PRODUCERS=$(csvtojson < $DATA_PATH/01-enedis-Producer.csv --delimiter=';')
# ENEDIS_PRODUCERS_NB=$(echo $ENEDIS_PRODUCERS | jq 'length')

# for i in `seq $ENEDIS_PRODUCERS_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         ENEDIS_PRODUCERS_VALUE=$(echo $ENEDIS_PRODUCERS | jq $tabindex)
#         ENEDIS_PRODUCERS_ID=$(echo $ENEDIS_PRODUCERS_VALUE | jq '.producerMarketParticipantMrid')
#         mapENEDIS_PRODUCERS["$ENEDIS_PRODUCERS_ID"]=$ENEDIS_PRODUCERS_VALUE
# done


# echo
# echo
# echo "***********************************"
# echo
# echo "** RTE - PRODUCER"
# echo

# RTE_PRODUCERS=$(csvtojson < $DATA_PATH/11-rte-Producer.csv --delimiter=';')
# RTE_PRODUCERS_NB=$(echo $RTE_PRODUCERS | jq 'length')

# for i in `seq $RTE_PRODUCERS_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         RTE_PRODUCERS_VALUE=$(echo $RTE_PRODUCERS | jq $tabindex)
#         RTE_PRODUCERS_ID=$(echo $RTE_PRODUCERS_VALUE | jq '.producerMarketParticipantMrid')
#         mapRTE_PRODUCERS["$RTE_PRODUCERS_ID"]=$RTE_PRODUCERS_VALUE
# done

# echo
# echo
# echo "***********************************"
# echo
# echo "** ENEDIS - SYSTEMOPERATOR"
# echo

# ENEDIS_SYSTEMOPERATORS=$(csvtojson < $DATA_PATH/02-enedis-MarketParticipants.csv --delimiter=';')
# ENEDIS_SYSTEMOPERATORS_NB=$(echo $ENEDIS_SYSTEMOPERATORS | jq 'length')

# for i in `seq $ENEDIS_SYSTEMOPERATORS_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         ENEDIS_SYSTEMOPERATORS_VALUE=$(echo $ENEDIS_SYSTEMOPERATORS | jq $tabindex)
#         ENEDIS_SYSTEMOPERATORS_ID=$(echo $ENEDIS_SYSTEMOPERATORS_VALUE | jq '.systemOperatorMarketParticipantMrid')
#         mapENEDIS_SYSTEMOPERATORS["$ENEDIS_SYSTEMOPERATORS_ID"]=$ENEDIS_SYSTEMOPERATORS_VALUE
# done


# echo
# echo
# echo "***********************************"
# echo
# echo "** RTE - SYSTEMOPERATOR"
# echo

# RTE_SYSTEMOPERATORS=$(csvtojson < $DATA_PATH/12-rte-MarketParticipants.csv --delimiter=';')
# RTE_SYSTEMOPERATORS_NB=$(echo $RTE_SYSTEMOPERATORS | jq 'length')

# for i in `seq $RTE_SYSTEMOPERATORS_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         RTE_SYSTEMOPERATORS_VALUE=$(echo $RTE_SYSTEMOPERATORS | jq $tabindex)
#         RTE_SYSTEMOPERATORS_ID=$(echo $RTE_SYSTEMOPERATORS_VALUE | jq '.systemOperatorMarketParticipantMrid')
#         mapRTE_SYSTEMOPERATORS["$RTE_SYSTEMOPERATORS_ID"]=$RTE_SYSTEMOPERATORS_VALUE
# done



# echo
# echo
# echo "***********************************"
# echo
# echo "** ENEDIS - SITE"
# echo

# ENEDIS_SITES=$(csvtojson < $DATA_PATH/03-enedis-Site.csv --delimiter=';')
# ENEDIS_SITES_NB=$(echo $ENEDIS_SITES | jq 'length')

# for i in `seq $ENEDIS_SITES_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         ENEDIS_SITES_VALUE=$(echo $ENEDIS_SITES | jq $tabindex)
#         ENEDIS_SITES_ID=$(echo $ENEDIS_SITES_VALUE | jq '.meteringPointMrid')
#         mapENEDIS_SITES["$ENEDIS_SITES_ID"]=$ENEDIS_SITES_VALUE
# done


# echo
# echo
# echo "***********************************"
# echo
# echo "** RTE - SITE"
# echo

# RTE_SITES=$(csvtojson < $DATA_PATH/13-rte-Site.csv --delimiter=';')
# RTE_SITES_NB=$(echo $RTE_SITES | jq 'length')

# for i in `seq $RTE_SITES_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         RTE_SITES_VALUE=$(echo $RTE_SITES | jq $tabindex)
#         RTE_SITES_ID=$(echo $RTE_SITES_VALUE | jq '.meteringPointMrid')
#         mapRTE_SITES["$RTE_SITES_ID"]=$RTE_SITES_VALUE
# done


# echo
# echo
# echo "***********************************"
# echo
# echo "** ENEDIS - ACTIVATIONDOCCUMENT"
# echo

# ENEDIS_ACTIVATIONDOCCUMENTS=$(cat $DATA_PATH/22-rte-OrdreLimitation-enedis.json | jq '.')
# ENEDIS_ACTIVATIONDOCCUMENTS_NB=$(echo $ENEDIS_ACTIVATIONDOCCUMENTS | jq 'length')

# for i in `seq $ENEDIS_ACTIVATIONDOCCUMENTS_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         ENEDIS_ACTIVATIONDOCCUMENTS_VALUE=$(echo $ENEDIS_ACTIVATIONDOCCUMENTS | jq $tabindex)
#         ENEDIS_ACTIVATIONDOCCUMENTS_ID=$(echo $ENEDIS_ACTIVATIONDOCCUMENTS_VALUE | jq '.activationDocumentMrid')
#         mapENEDIS_ACTIVATIONDOCCUMENTS["$ENEDIS_ACTIVATIONDOCCUMENTS_ID"]=$ENEDIS_ACTIVATIONDOCCUMENTS_VALUE
# done


# echo
# echo
# echo "***********************************"
# echo
# echo "** RTE - ACTIVATIONDOCCUMENT"
# echo

# RTE_ACTIVATIONDOCCUMENTS=$(cat $DATA_PATH/21-rte-OrdreLimitation-rte.json | jq '.')
# RTE_ACTIVATIONDOCCUMENTS_NB=$(echo $RTE_ACTIVATIONDOCCUMENTS | jq 'length')

# for i in `seq $RTE_ACTIVATIONDOCCUMENTS_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         RTE_ACTIVATIONDOCCUMENTS_VALUE=$(echo $RTE_ACTIVATIONDOCCUMENTS | jq $tabindex)
#         RTE_ACTIVATIONDOCCUMENTS_START=$(echo $RTE_ACTIVATIONDOCCUMENTS_VALUE | jq '.startCreatedDateTime')
#         RTE_ACTIVATIONDOCCUMENTS_END=$(echo $RTE_ACTIVATIONDOCCUMENTS_VALUE | jq '.endCreatedDateTime')
#         RTE_ACTIVATIONDOCCUMENTS_ID=$(echo $RTE_ACTIVATIONDOCCUMENTS_START"99"$RTE_ACTIVATIONDOCCUMENTS_END)
#         RTE_ACTIVATIONDOCCUMENTS_ID=$(echo $RTE_ACTIVATIONDOCCUMENTS_ID | sed "s/\"//g")
#         RTE_ACTIVATIONDOCCUMENTS_ID=$(echo $RTE_ACTIVATIONDOCCUMENTS_ID | sed "s/\://g")
#         RTE_ACTIVATIONDOCCUMENTS_ID=$(echo $RTE_ACTIVATIONDOCCUMENTS_ID | sed "s/-//g")
#         RTE_ACTIVATIONDOCCUMENTS_ID=$(echo $RTE_ACTIVATIONDOCCUMENTS_ID | sed "s/T//g")
#         RTE_ACTIVATIONDOCCUMENTS_ID=$(echo $RTE_ACTIVATIONDOCCUMENTS_ID | sed "s/Z//g")
#         RTE_ACTIVATIONDOCCUMENTS_ID=$(echo $RTE_ACTIVATIONDOCCUMENTS_ID | sed "s/null//g")
#         mapRTE_ACTIVATIONDOCCUMENTS["$RTE_ACTIVATIONDOCCUMENTS_ID"]=$RTE_ACTIVATIONDOCCUMENTS_VALUE
# done

# for key in ${!mapRTE_ACTIVATIONDOCCUMENTS[@]};do
#  echo $key
#  echo ${mapRTE_ACTIVATIONDOCCUMENTS[$key]}
# done

# echo "***********************************"
# echo
# echo "** ENEDIS"
# echo

# echo
# echo "GetActivationDocumentHistory"
# echo



echo
echo
echo "***********************************"
echo
echo "** RTE"
echo

echo
echo "GetActivationDocumentHistory"
echo


echo "--- process start $(date +"%T.%3N") ---"

OUTPUT_RTE=$(
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                peer chaincode invoke \
                -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls $RTE_TLSOPT \
                -c '{"Args":["GetActivationDocumentHistory", "{}"]}' 2>&1)


echo "--- process end   $(date +"%T.%3N") ---"




# echo
# echo "GetActivationDocumentHistory"
# echo

# RTE_SITES=$(csvtojson < $DATA_PATH/13-rte-Site.csv --delimiter=';')
# RTE_SITES_NB=$(echo $RTE_SITES | jq 'length')

# RTE_TOTALRESULT=""

# for i in `seq $RTE_SITES_NB`
# do
#         tabindex=$(echo ".["$i-1"]")
#         RTE_SITES_VALUE=$(echo $RTE_SITES | jq $tabindex)
#         RTE_SITE_ID=$(echo $RTE_SITES_VALUE | jq '.meteringPointMrid')
#         RTE_SITE_ID=$(echo $RTE_SITE_ID | sed "s/\"/\\\\\"/g")

#         RTE_CRITERIA_meteringPointMrid_STR='{\"meteringPointMrid\":'$RTE_SITE_ID'}'
#         RTE_CRITERIA_meteringPointMrid_STR=${RTE_CRITERIA_meteringPointMrid_STR//[$'\t\r\n ']}

#         OUTPUT_RTE=$(
#                 kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
#                         peer chaincode invoke \
#                         -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls $RTE_TLSOPT \
#                         -c '{"Args":["GetActivationDocumentHistory","'$RTE_CRITERIA_meteringPointMrid_STR'"]}' 2>&1)

#         # echo "*-*-*-*-*-*-*"
#         # echo $OUTPUT_RTE
#         # echo "*-*-*-*-*-*-*"

#         OUTPUT_RTE=$(echo $OUTPUT_RTE | grep -o -P '(?<=").*(?=")')
#         OUTPUT_RTE=$(echo $OUTPUT_RTE | sed "s/\\\\\"/\"/g")
#         OUTPUT_RTE=$(printf "%b" $OUTPUT_RTE)
#         OUTPUT_RTE=$(jq -n $OUTPUT_RTE)

#         RTE_TOTALRESULT=$((echo $RTE_TOTALRESULT; echo $OUTPUT_RTE) | jq -n '[ inputs[] ] | unique_by(."activationDocument"."activationDocumentMrid")')

# done

# RTE_TOTALRESULT_NB=$(echo $RTE_TOTALRESULT | jq 'length')

# for i in `seq $RTE_TOTALRESULT_NB`
# do
#     index=$(($i-1))
#     activationDocument_VALUE=$(echo $RTE_TOTALRESULT | jq --argjson index $index '.[$index].activationDocument')
#     subOrderList_VALUE=$(echo $RTE_TOTALRESULT | jq --argjson index $index '.[$index].subOrderList')
#     site_VALUE=$(echo $RTE_TOTALRESULT | jq --argjson index $index '.[$index].site')
#     producer_VALUE=$(echo $RTE_TOTALRESULT | jq --argjson index $index '.[$index].producer')
#     energyAmount_VALUE=$(echo $RTE_TOTALRESULT | jq --argjson index $index '.[$index].energyAmount')
#     echo "00000000000000000000000000000000000"
#     echo $activationDocument_VALUE
#     echo "###"
#     echo $subOrderList_VALUE
#     echo "###"
#     echo $site_VALUE
#     echo "###"
#     echo $producer_VALUE
#     echo "###"
#     echo $energyAmount_VALUE
#     echo "00000000000000000000000000000000000"
# done




echo ""
echo "End of invoke command"
echo "***************************************"
