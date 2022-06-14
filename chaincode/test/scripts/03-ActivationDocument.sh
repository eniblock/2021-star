#!/bin/sh

PODNAME=$(kubectl get pod -n rte -l app.kubernetes.io/component=peer -o name)
VAR=$(kubectl exec -n rte -c peer $PODNAME -- env)

VAR1=$(echo "$VAR" | grep CORE_PEER_ADDRESS)
VAR2=$(echo "$VAR" | grep CORE_PEER_TLS_ROOTCERT_FILE)

VALUE_CORE_PEER_ADDRESS=${VAR1##*CORE_PEER_ADDRESS=}
VALUE_CORE_PEER_TLS_ROOTCERT_FILE=${VAR2##*CORE_PEER_TLS_ROOTCERT_FILE=}

CHAINCODE=star
CHANNEL=star
ORDERER=orderer1.orderer.localhost:443
CAFILE=/var/hyperledger/tls/ord/cert/cacert.pem


SYSTEM_OPER_NUM=$(tr -dc 0-9 </dev/urandom | head -c 6 ; echo '')
SYSTEM_OPER_ID="17V000000$SYSTEM_OPER_NUM""D"
SYSTEM_OPER_INPUT_STR='{\"systemOperatorMarketParticipantMrid\":\"'$SYSTEM_OPER_ID'\",\"systemOperatorMarketParticipantName\":\"rte\",\"systemOperatorMarketParticipantRoleType\":\"A49\"}'

PRODUCER_NUM=$(tr -dc 0-9 </dev/urandom | head -c 6 ; echo '')
PRODUCER_ID="17X000000$PRODUCER_NUM""X"
PRODUCER_INPUT_STR='{\"producerMarketParticipantMrid\":\"'$PRODUCER_ID'\",\"producerMarketParticipantName\":\"EolienFRvertCie\",\"producerMarketParticipantRoleType\":\"A21\"}'


SITE_NUM=$(tr -dc 0-9 </dev/urandom | head -c 6 ; echo '')
SITE_ID="PDL00000000$SITE_NUM"
SITE_INPUT_STR='{\"meteringPointMrid\":\"'$SITE_ID'\",\"systemOperatorMarketParticipantMrid\":\"'$SYSTEM_OPER_ID'\",\"producerMarketParticipantMrid\":\"'$PRODUCER_ID'\",\"technologyType\":\"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Genonville\",\"substationMrid\":\"GDOA4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"CodePPE\",\"schedulingEntityRegisteredResourceMrid\":\"CodeEDP\",\"siteAdminMrid\":\"489981029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ1\",\"systemOperatorCustomerServiceName\":\"DRNantesDeux-Sèvres\"}'

DATE=$(date -d "1 day ago" +"%F")
DATE_DEBUT=$(echo $DATE"T00:00:00.001Z")
DATE_FIN=$(echo $DATE"T23:29:10.001Z")
DOC_NUM=$(tr -dc 0-9 </dev/urandom | head -c 6 ; echo '')
DOCPARENT_ID="ACTIVE_DOCUMENT_PARENT_$DOC_NUM"
DOCPARENT_STR='{\"activationDocumentMrid\":\"'$DOCPARENT_ID'\",\"originAutomationRegisteredResourceMrid\":\"YP1\",\"registeredResourceMrid\":\"'$SITE_ID'\",\"measurementUnitName\":\"MW\",\"messageType\":\"A54\",\"businessType\":\"string\",\"orderEnd\":false,\"orderValue\":\"1\",\"startCreatedDateTime\":\"'$DATE_DEBUT'\",\"revisionNumber\":\"1\",\"reasonCode\":\"string\",\"senderMarketParticipantMrid\":\"'$SYSTEM_OPER_ID'\",\"receiverMarketParticipantMrid\":\"'$PRODUCER_ID'\"}'
DOCCHILD_ID="ACTIVE_DOCUMENT_CHILD_$DOC_NUM"
DOCCHILD_STR='{\"activationDocumentMrid\":\"'$DOCCHILD_ID'\",\"originAutomationRegisteredResourceMrid\":\"YP1\",\"registeredResourceMrid\":\"'$SITE_ID'\",\"measurementUnitName\":\"MW\",\"messageType\":\"string\",\"businessType\":\"string\",\"orderEnd\":false,\"orderValue\":\"1\",\"endCreatedDateTime\":\"'$DATE_FIN'\",\"revisionNumber\":\"1\",\"reasonCode\":\"string\",\"senderMarketParticipantMrid\":\"'$SYSTEM_OPER_ID'\",\"receiverMarketParticipantMrid\":\"'$PRODUCER_ID'\"}'


echo "***************************************"
echo "Start of invoke command"
echo ""

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["CreateSystemOperator","'$SYSTEM_OPER_INPUT_STR'"]}'

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["CreateProducer","'$PRODUCER_INPUT_STR'"]}'

sleep 2s

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["CreateSite","'$SITE_INPUT_STR'"]}'

sleep 2s

echo "CREATION DOCS : $DOC_NUM"

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["CreateActivationDocument","'$DOCPARENT_STR'"]}'

sleep 2s

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["CreateActivationDocument","'$DOCCHILD_STR'"]}'


echo ""
echo "End of invoke command"
echo "***************************************"
