#!/bin/bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_id {
    local KEY=$(one_line_pem $2)
    local CERT=$(one_line_pem $3)
    sed -e "s/\${ORG}/$1/" \
        -e "s#\${KEY}#$KEY#" \
        -e "s#\${CERT}#$CERT#" \
        user-template.id
}

ORG=$1
KEY=generated/crypto-config/peerOrganizations/$ORG/users/User1@$ORG/msp/keystore/priv_sk
CERT=generated/crypto-config/peerOrganizations/$ORG/ca/ca.$ORG-cert.pem

echo "$(json_id $ORG $KEY $CERT)" > generated/crypto-config/peerOrganizations/$ORG/User1.id
