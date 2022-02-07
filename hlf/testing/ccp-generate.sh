#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

# function json_ccp {
#     local PP=$(one_line_pem $4)
#     local CP=$(one_line_pem $5)
#     sed -e "s/\${ORG}/$1/" \
#         -e "s/\${P0PORT}/$2/" \
#         -e "s/\${CAPORT}/$3/" \
#         -e "s#\${PEERPEM}#$PP#" \
#         -e "s#\${CAPEM}#$CP#" \
#         ccp-template.json
# }

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=$1
P0PORT=7051
CAPORT=7054
PEERPEM=generated/crypto-config/peerOrganizations/$ORG/tlsca/tlsca.$ORG-cert.pem
CAPEM=generated/crypto-config/peerOrganizations/$ORG/ca/ca.$ORG-cert.pem

# echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > generated/crypto-config/peerOrganizations/$ORG/connection-$ORG.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > generated/crypto-config/peerOrganizations/$ORG/connection-$ORG.yaml
