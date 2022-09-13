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

echo $OUTPUT_ENEDIS_TOPRINT

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
                TLSOPT=""
                if [[ "[$collection_ENEDIS]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $ENEDIS_TLSOPT"
                fi
                if [[ "[$collection_PRODUCER]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $PRODUCER_TLSOPT"
                fi
                # if [[ "[$collection_RTE]" != "[]" ]]
                # then
                #         TLSOPT="$TLSOPT $RTE_TLSOPT"
                # fi

                echo
                echo "UpdateActivationDocumentByOrders $COLLECTION_OUTPUT"
                echo $TLSOPT
                echo $VALUE_OUTPUT
                echo

                kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                        peer chaincode invoke \
                        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                        --tls $TLSOPT \
                        -c '{"Args":["UpdateActivationDocumentByOrders","'$VALUE_OUTPUT'"]}'

        fi
        START="{"

        echo
        echo "wait $PAUSE_TIME"
        sleep $PAUSE_TIME

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
                TLSOPT=""
                # if [[ "[$collection_ENEDIS]" != "[]" ]]
                # then
                #         TLSOPT="$TLSOPT $ENEDIS_TLSOPT"
                # fi
                if [[ "[$collection_PRODUCER]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $PRODUCER_TLSOPT"
                fi
                if [[ "[$collection_RTE]" != "[]" ]]
                then
                        TLSOPT="$TLSOPT $RTE_TLSOPT"
                fi

                echo
                echo "UpdateActivationDocumentByOrders $COLLECTION_OUTPUT"
                echo

                kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
                        peer chaincode invoke \
                        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE \
                        --tls $TLSOPT \
                        -c '{"Args":["UpdateActivationDocumentByOrders","'$VALUE_OUTPUT'"]}'

        fi
        START="{"
done;


echo ""
echo "End of invoke command"
echo "***************************************"
