#!/bin/bash

ONLINE_MODE=true

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS

NB_ACTIVATIONDOCUMENT=100
INIT_DATE="2099-01-01"


echo "***************************************"
echo "Start of invoke command"
echo ""



echo "***********************************"
echo
echo "** RTE to ENEDIS - ACTIVATION DOCUMENTS DATA CREATION START"
echo

RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE=$(cat $DATA_PATH/03-ActivationDocuments/25-rte-OrdreLimitation-enedis-start_100.json | jq '.')
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo "[]" | jq '.')
START_DATE=$(date -d $INIT_DATE -I)

for i in `seq $NB_ACTIVATIONDOCUMENT`
do
    index=$(($i-1))
    activationDocumentMrid=$(tr -dc 0-9 </dev/urandom | head -c 10 ; echo '')
    activationDocumentMrid=$(echo "activationDocument_rte_$activationDocumentMrid")
    startCreatedDateTime=$(date -d $START_DATE' + '$i' day' -Iseconds)
    startCreatedDateTime=$(echo $startCreatedDateTime"Z")
    ELEMENT_VALUE=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE | jq --arg startCreatedDateTime $startCreatedDateTime --arg activationDocumentMrid $activationDocumentMrid '. + {activationDocumentMrid: $activationDocumentMrid, startCreatedDateTime: $startCreatedDateTime}')
    RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | jq --argjson index $index --argjson ELEMENT_VALUE "$ELEMENT_VALUE" '.[$index] |= . + $ELEMENT_VALUE' )
done
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=$(echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_WITHID | sed "s/\"/\\\\\"/g")
RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR=${RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR//[$'\t\r\n ']}

echo $RTE_ENEDIS_ACTIVATIONDOCUMENT_VALUE_STR

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



echo ""
echo "End of invoke command"
echo "***************************************"
