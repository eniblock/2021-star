#!/bin/bash

ONLINE_MODE=true
DO_RECONCILIATION=true

OLD_IFS=$IFS
source ./zzz-config.sh
IFS=$OLD_IFS

declare -A mapRTE_RECONCILIATION
declare -A mapENEDIS_RECONCILIATION
listRTE_RECONCILIATION_Key=()
listENEDIS_RECONCILIATION_Key=()
declare -A mapRTE_RECONCILIATION_TLSOPT
declare -A mapENEDIS_RECONCILIATION_TLSOPT


echo "***************************************"
echo "Start of invoke command"
echo ""

echo "***********************************"
echo
echo "** ENEDIS"
echo


echo
echo "GetActivationDocumentReconciliationState"
echo
OUTPUT_ENEDIS=$(
kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls $ENEDIS_TLSOPT \
        -c '{"Args":["GetActivationDocumentReconciliationState"]}' 2>&1)


OUTPUT_ENEDIS=$(echo $OUTPUT_ENEDIS | grep -o -P '(?<=").*(?=")')
OUTPUT_ENEDIS=$(printf "%b" $OUTPUT_ENEDIS)

echo
echo "Call Result"
echo

OUTPUT_ENEDIS_TOPRINT=$(echo $OUTPUT_ENEDIS | sed "s/\\\\\"/\"/g")

# echo $OUTPUT_ENEDIS_TOPRINT

echo
echo
echo


OUTPUT_ENEDIS="${OUTPUT_ENEDIS:1:-1}"


DELIMITER="}},{"
OUTPUT_ENEDIS=$OUTPUT_ENEDIS$DELIMITER

START=""
END="}}"

while [[ $OUTPUT_ENEDIS ]]; do
        VALUE_OUTPUT=( "${OUTPUT_ENEDIS%%"$DELIMITER"*}" );
        OUTPUT_ENEDIS=${OUTPUT_ENEDIS#*"$DELIMITER"};

        if [[ "[$OUTPUT_ENEDIS]" == "[]" ]]
        then
                END=""
        fi

        VALUE_OUTPUT="[$START$VALUE_OUTPUT$END]"

        if [[ $VALUE_OUTPUT != "[]" ]]
        then
                COLLECTION_OUTPUT=( "${VALUE_OUTPUT#*"collection"}" );
                COLLECTION_OUTPUT=( "${COLLECTION_OUTPUT%%","*}" );
                collection_ENEDIS=$(echo $VALUE_OUTPUT | grep "enedis")
                collection_PRODUCER=$(echo $VALUE_OUTPUT | grep "producer")
                collection_RTE=$(echo $VALUE_OUTPUT | grep "rte")
                collection_KEY=""
                TLSOPT=""
                if [[ "[$collection_ENEDIS]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $ENEDIS_TLSOPT"
                        collection_KEY=$collection_KEY"ENEDIS"
                fi
                if [[ "[$collection_PRODUCER]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $PRODUCER_TLSOPT"
                        collection_KEY=$collection_KEY"PRODUCER"
                fi
                if [[ "[$collection_RTE]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $RTE_TLSOPT"
                        collection_KEY=$collection_KEY"RTE"
                fi

                if [[ " ${listENEDIS_RECONCILIATION_Key[*]} " =~ " ${collection_KEY} " ]]
                then
                        LIST_VALUE=${mapENEDIS_RECONCILIATION[$collection_KEY]}
                        LIST_VALUE+=(",")
                else
                        LIST_VALUE=()
                        listENEDIS_RECONCILIATION_Key+=($collection_KEY)
                        mapENEDIS_RECONCILIATION_TLSOPT[$collection_KEY]=$TLSOPT
                fi
                VALUE_OUTPUT=${VALUE_OUTPUT::-1}
                VALUE_OUTPUT=${VALUE_OUTPUT:1}

                LIST_VALUE+=($VALUE_OUTPUT)
                mapENEDIS_RECONCILIATION[$collection_KEY]=${LIST_VALUE[@]}
        fi
        START="{"

done;

for KEY in ${listENEDIS_RECONCILIATION_Key[@]}; do
        echo "----------------------------------------"
        echo "UpdateActivationDocumentByOrders $COLLECTION_OUTPUT"
        echo "KEY :"$KEY
        TLSOPT=${mapENEDIS_RECONCILIATION_TLSOPT[$KEY]}
        echo "TLSOPT :"$TLSOPT
        TODO=${mapENEDIS_RECONCILIATION[$KEY]}
        TODO_STR=$(echo "["${TODO[@]}"]")
        TODO_STR=${TODO_STR//[$'\t\r\n ']}
        # echo "TODO_STR :"$TODO_STR

        if $DO_RECONCILIATION
        then
                kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                        peer chaincode invoke \
                        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                        --tls $TLSOPT \
                        -c '{"Args":["UpdateActivationDocumentByOrders","'$TODO_STR'"]}'
        fi
        echo
done;




echo
echo
echo "***********************************"
echo
echo "** RTE"
echo




echo
echo "GetActivationDocumentReconciliationState"
echo
OUTPUT_RTE=$(
kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls $RTE_TLSOPT \
        -c '{"Args":["GetActivationDocumentReconciliationState"]}' 2>&1)


OUTPUT_RTE=$(echo $OUTPUT_RTE | grep -o -P '(?<=").*(?=")')
OUTPUT_RTE="${OUTPUT_RTE:1:-1}"

DELIMITER="}},{"
OUTPUT_RTE=$OUTPUT_RTE$DELIMITER

START=""
END="}}"


while [[ $OUTPUT_RTE ]]; do
        VALUE_OUTPUT=( "${OUTPUT_RTE%%"$DELIMITER"*}" );
        OUTPUT_RTE=${OUTPUT_RTE#*"$DELIMITER"};

        if [[ "[$OUTPUT_RTE]" == "[]" ]]
        then
                END=""
        fi

        VALUE_OUTPUT="[$START$VALUE_OUTPUT$END]"

        if [[ $VALUE_OUTPUT != "[]" ]]
        then
                COLLECTION_OUTPUT=( "${VALUE_OUTPUT#*"collection"}" );
                COLLECTION_OUTPUT=( "${COLLECTION_OUTPUT%%","*}" );
                collection_ENEDIS=$(echo $VALUE_OUTPUT | grep "enedis")
                collection_PRODUCER=$(echo $VALUE_OUTPUT | grep "producer")
                collection_RTE=$(echo $VALUE_OUTPUT | grep "rte")
                collection_KEY=""
                TLSOPT=""
                if [[ "[$collection_ENEDIS]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $ENEDIS_TLSOPT"
                        collection_KEY=$collection_KEY"ENEDIS"
                fi
                if [[ "[$collection_PRODUCER]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $PRODUCER_TLSOPT"
                        collection_KEY=$collection_KEY"PRODUCER"
                fi
                if [[ "[$collection_RTE]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $RTE_TLSOPT"
                        collection_KEY=$collection_KEY"RTE"
                fi

                if [[ " ${listRTE_RECONCILIATION_Key[*]} " =~ " ${collection_KEY} " ]]
                then
                        LIST_VALUE=${mapRTE_RECONCILIATION[$collection_KEY]}
                        LIST_VALUE+=(",")
                else
                        LIST_VALUE=()
                        listRTE_RECONCILIATION_Key+=($collection_KEY)
                        mapRTE_RECONCILIATION_TLSOPT[$collection_KEY]=$TLSOPT
                fi
                VALUE_OUTPUT=${VALUE_OUTPUT::-1}
                VALUE_OUTPUT=${VALUE_OUTPUT:1}

                LIST_VALUE+=($VALUE_OUTPUT)
                mapRTE_RECONCILIATION[$collection_KEY]=${LIST_VALUE[@]}

        fi
        START="{"
done;


for KEY in ${listRTE_RECONCILIATION_Key[@]}; do
        echo "----------------------------------------"
        echo "UpdateActivationDocumentByOrders $COLLECTION_OUTPUT"
        echo "KEY :"$KEY
        TLSOPT=${mapRTE_RECONCILIATION_TLSOPT[$KEY]}
        echo "TLSOPT :"$TLSOPT
        TODO=${mapRTE_RECONCILIATION[$KEY]}
        TODO_STR=$(echo "["${TODO[@]}"]")
        TODO_STR=${TODO_STR//[$'\t\r\n ']}
        # echo "TODO_STR :"$TODO_STR

        if $DO_RECONCILIATION
        then
                kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                        peer chaincode invoke \
                        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                        --tls $TLSOPT \
                        -c '{"Args":["UpdateActivationDocumentByOrders","'$TODO_STR'"]}'
        fi

        echo
done;



echo ""
echo "End of invoke command"
echo "***************************************"
