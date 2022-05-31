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
SYSTEM_OPER_INPUT_STR='{\"systemOperatorMarketParticipantMrid\":\"'$SYSTEM_OPER_ID'\",\"systemOperatorMarketParticipantName\":\"RTE\",\"systemOperatorMarketParticipantRoleType\":\"A49\"}'

PRODUCER_NUM=$(tr -dc 0-9 </dev/urandom | head -c 6 ; echo '')
PRODUCER_ID="17X000000$PRODUCER_NUM""X"
PRODUCER_INPUT_STR='{\"producerMarketParticipantMrid\":\"'$PRODUCER_ID'\",\"producerMarketParticipantName\":\"EolienFRvertCie\",\"producerMarketParticipantRoleType\":\"A21\"}'


SITE_NUM=$(tr -dc 0-9 </dev/urandom | head -c 6 ; echo '')
SITE_ID="PDL00000000$SITE_NUM"
SITE_INPUT_STR='{\"meteringPointMrid\":\"'$SITE_ID'\",\"systemOperatorMarketParticipantMrid\":\"17V000000992746D\",\"producerMarketParticipantMrid\":\"17X000001309745X\",\"technologyType\":\"Eolien\",\"siteType\":\"Injection\",\"siteName\":\"Genonville\",\"substationMrid\":\"GDOA4RTD\",\"substationName\":\"CIVRAY\",\"marketEvaluationPointMrid\":\"CodePPE\",\"schedulingEntityRegisteredResourceMrid\":\"CodeEDP\",\"siteAdminMrid\":\"489981029\",\"siteLocation\":\"Biscarosse\",\"siteIecCode\":\"S7X0000013077478\",\"systemOperatorEntityFlexibilityDomainMrid\":\"PSC4511\",\"systemOperatorEntityFlexibilityDomainName\":\"Départ1\",\"systemOperatorCustomerServiceName\":\"DRNantesDeux-Sèvres\"}'

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
        -c '{"Args":["QuerySystemOperator","'$SYSTEM_OPER_ID'"]}'


kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["CreateProducer","'$PRODUCER_INPUT_STR'"]}'

# sleep 2s

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["CreateSite","'$SITE_INPUT_STR'"]}'

# sleep 2s

kubectl exec -n rte -c peer $PODNAME -- env CORE_PEER_MSPCONFIGPATH=/var/hyperledger/admin_msp \
	peer chaincode invoke \
        -n $CHAINCODE -C $CHANNEL -o $ORDERER --cafile $CAFILE --tls --peerAddresses $VALUE_CORE_PEER_ADDRESS --tlsRootCertFiles $VALUE_CORE_PEER_TLS_ROOTCERT_FILE \
        -c '{"Args":["QuerySite","'$SITE_ID'"]}'

echo ""
echo "End of invoke command"
echo "***************************************"
