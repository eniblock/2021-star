#!/bin/bash
IFS=' '


#######################################################
#######################################################
##                    CONFIG ENV                     ##
#######################################################
#######################################################



######## Extract K8S VALUES
ENEDIS_NODE=enedis
ENEDIS_PODNAME=$(kubectl get pod -n $ENEDIS_NODE -l app.kubernetes.io/component=peer -o name)

PRODUCER_NODE=producer
PRODUCER_PODNAME=$(kubectl get pod -n $PRODUCER_NODE -l app.kubernetes.io/component=peer -o name)

RTE_NODE=rte
RTE_PODNAME=$(kubectl get pod -n $RTE_NODE -l app.kubernetes.io/component=peer -o name)


######## config K8S RTE
VAR=$(kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- env)

TEMP1=$(echo "$VAR" | grep CORE_PEER_ADDRESS)
TEMP2=${TEMP1##*CORE_PEER_ADDRESS=}
read -ra TEMP3 <<< $TEMP2
RTE_VALUE_CORE_PEER_ADDRESS=${TEMP3[0]}

TEMP1=$(echo "$VAR" | grep CORE_PEER_TLS_ROOTCERT_FILE)
TEMP2=${TEMP1##*CORE_PEER_TLS_ROOTCERT_FILE=}
read -ra TEMP3 <<< $TEMP2
RTE_VALUE_CORE_PEER_TLS_ROOTCERT_FILE=${TEMP3[0]}


TEMP1=$(echo "$VAR" | grep CORE_PEER_GOSSIP_ENDPOINT)
TEMP2=${TEMP1##*CORE_PEER_GOSSIP_ENDPOINT=}
read -ra TEMP3 <<< $TEMP2
RTE_VALUE_CORE_PEER_GOSSIP_ENDPOINT=${TEMP3[0]}

## RTE TLS MGT FOR TEST
TLS_TEMP=$(kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- ls /tmp/$RTE_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$RTE_NODE-tls.crt
        kubectl cp -c peer $RTE_NODE-tls.crt $RTE_NODE/${RTE_PODNAME:4}:/tmp/$RTE_NODE-tls.crt
fi
TLS_TEMP=$(kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- ls /tmp/$ENEDIS_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$ENEDIS_NODE-tls.crt
        kubectl cp -c peer $ENEDIS_NODE-tls.crt $RTE_NODE/${RTE_PODNAME:4}:/tmp/$ENEDIS_NODE-tls.crt
fi
TLS_TEMP=$(kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- ls /tmp/$PRODUCER_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$PRODUCER_NODE-tls.crt
        kubectl cp -c peer $PRODUCER_NODE-tls.crt $RTE_NODE/${RTE_PODNAME:4}:/tmp/$PRODUCER_NODE-tls.crt
fi



######## config K8S ENEDIS
VAR=$(kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- env)

TEMP1=$(echo "$VAR" | grep CORE_PEER_ADDRESS)
TEMP2=${TEMP1##*CORE_PEER_ADDRESS=}
read -ra TEMP3 <<< $TEMP2
ENEDIS_VALUE_CORE_PEER_ADDRESS=${TEMP3[0]}

TEMP1=$(echo "$VAR" | grep CORE_PEER_TLS_ROOTCERT_FILE)
TEMP2=${TEMP1##*CORE_PEER_TLS_ROOTCERT_FILE=}
read -ra TEMP3 <<< $TEMP2
ENEDIS_VALUE_CORE_PEER_TLS_ROOTCERT_FILE=${TEMP3[0]}


TEMP1=$(echo "$VAR" | grep CORE_PEER_GOSSIP_ENDPOINT)
TEMP2=${TEMP1##*CORE_PEER_GOSSIP_ENDPOINT=}
read -ra TEMP3 <<< $TEMP2
ENEDIS_VALUE_CORE_PEER_GOSSIP_ENDPOINT=${TEMP3[0]}

## ENEDIS TLS MGT FOR TEST
TLS_TEMP=$(kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- ls /tmp/$RTE_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$RTE_NODE-tls.crt
        kubectl cp -c peer $RTE_NODE-tls.crt $ENEDIS_NODE/${ENEDIS_PODNAME:4}:/tmp/$RTE_NODE-tls.crt
fi
TLS_TEMP=$(kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- ls /tmp/$ENEDIS_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$ENEDIS_NODE-tls.crt
        kubectl cp -c peer $ENEDIS_NODE-tls.crt $ENEDIS_NODE/${ENEDIS_PODNAME:4}:/tmp/$ENEDIS_NODE-tls.crt
fi
TLS_TEMP=$(kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- ls /tmp/$PRODUCER_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$PRODUCER_NODE-tls.crt
        kubectl cp -c peer $PRODUCER_NODE-tls.crt $ENEDIS_NODE/${ENEDIS_PODNAME:4}:/tmp/$PRODUCER_NODE-tls.crt
fi



######## config K8S PRODUCER
VAR=$(kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- env)

TEMP1=$(echo "$VAR" | grep CORE_PEER_ADDRESS)
TEMP2=${TEMP1##*CORE_PEER_ADDRESS=}
read -ra TEMP3 <<< $TEMP2
PRODUCER_VALUE_CORE_PEER_ADDRESS=${TEMP3[0]}

TEMP1=$(echo "$VAR" | grep CORE_PEER_TLS_ROOTCERT_FILE)
TEMP2=${TEMP1##*CORE_PEER_TLS_ROOTCERT_FILE=}
read -ra TEMP3 <<< $TEMP2
PRODUCER_VALUE_CORE_PEER_TLS_ROOTCERT_FILE=${TEMP3[0]}


TEMP1=$(echo "$VAR" | grep CORE_PEER_GOSSIP_ENDPOINT)
TEMP2=${TEMP1##*CORE_PEER_GOSSIP_ENDPOINT=}
read -ra TEMP3 <<< $TEMP2
PRODUCER_VALUE_CORE_PEER_GOSSIP_ENDPOINT=${TEMP3[0]}

## PRODUCER TLS MGT FOR TEST
TLS_TEMP=$(kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- ls /tmp/$RTE_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $RTE_NODE -c peer $RTE_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$RTE_NODE-tls.crt
        kubectl cp -c peer $RTE_NODE-tls.crt $PRODUCER_NODE/${PRODUCER_PODNAME:4}:/tmp/$RTE_NODE-tls.crt
fi
TLS_TEMP=$(kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- ls /tmp/$ENEDIS_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $ENEDIS_NODE -c peer $ENEDIS_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$ENEDIS_NODE-tls.crt
        kubectl cp -c peer $ENEDIS_NODE-tls.crt $PRODUCER_NODE/${PRODUCER_PODNAME:4}:/tmp/$ENEDIS_NODE-tls.crt
fi
TLS_TEMP=$(kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- ls /tmp/$PRODUCER_NODE-tls.crt 2> /dev/null)
if [[ $TLS_TEMP != "/tmp/$RTE_NODE-tls.crt" ]]
then
        kubectl exec -n $PRODUCER_NODE -c peer $PRODUCER_PODNAME -- cat /var/hyperledger/tls/server/pair/tls.crt >$PRODUCER_NODE-tls.crt
        kubectl cp -c peer $PRODUCER_NODE-tls.crt $PRODUCER_NODE/${PRODUCER_PODNAME:4}:/tmp/$PRODUCER_NODE-tls.crt
fi


######## config HLF
CHAINCODE=star
CHANNEL=star
ORDERER=orderer1.orderer.localhost:443
CAFILE=/var/hyperledger/tls/ord/cert/cacert.pem

LOCAL_TLSOPT=$(echo "--peerAddresses 0.0.0.0:7051 --tlsRootCertFiles /var/hyperledger/tls/server/pair/tls.crt")
ENEDIS_TLSOPT=$(echo "--peerAddresses $ENEDIS_VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles /tmp/$ENEDIS_NODE-tls.crt")
PRODUCER_TLSOPT=$(echo "--peerAddresses $PRODUCER_VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles /tmp/$PRODUCER_NODE-tls.crt")
RTE_TLSOPT=$(echo "--peerAddresses $RTE_VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles /tmp/$RTE_NODE-tls.crt")
