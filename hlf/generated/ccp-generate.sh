#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.json
}

# function yaml_ccp {
#     local PP=$(one_line_pem $4)
#     local CP=$(one_line_pem $5)
#     sed -e "s/\${ORG}/$1/" \
#         -e "s/\${P0PORT}/$2/" \
#         -e "s/\${CAPORT}/$3/" \
#         -e "s#\${PEERPEM}#$PP#" \
#         -e "s#\${CAPEM}#$CP#" \
#         ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
# }

ORG=rte
P0PORT=7051
CAPORT=7054
PEERPEM=crypto-config/peerOrganizations/rte/tlsca/tlsca.rte-cert.pem
CAPEM=crypto-config/peerOrganizations/rte/ca/ca.rte-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > crypto-config/peerOrganizations/rte/connection-rte.json
# echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > crypto-config/peerOrganizations/rte/connection-rte.yaml

ORG=enedis
P0PORT=9051
CAPORT=8054
PEERPEM=crypto-config/peerOrganizations/enedis/tlsca/tlsca.enedis-cert.pem
CAPEM=crypto-config/peerOrganizations/enedis/ca/ca.enedis-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > crypto-config/peerOrganizations/enedis/connection-enedis.json
# echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > crypto-config/peerOrganizations/enedis/connection-enedis.yaml
