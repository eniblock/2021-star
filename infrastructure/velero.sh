#!/bin/bash

CLUSTER_REGION=$1 # sbg // gra

function install_velero {
    ENV=${CLUSTER_REGION}
    velero install \
     --provider aws \
     --plugins velero/velero-plugin-for-aws:v1.5.0 \
     --bucket velero \
     --secret-file ./creds \
     --backup-location-config region=${ENV},s3ForcePathStyle="true",s3Url=https://s3.${ENV}.cloud.ovh.net \
     --use-restic \
     --restic-pod-cpu-request 100m \
     --use-volume-snapshots=false
}

function create_schedules {
    ENV=$1
    velero schedule create ${ENV}-1h --ttl 24h --include-namespaces ${ENV} --default-volumes-to-restic --schedule="@every 1h"
    velero schedule create ${ENV}-6h --ttl 168h --include-namespaces ${ENV} --default-volumes-to-restic --schedule="@every 6h"
    velero schedule create ${ENV}-24h --include-namespaces ${ENV} --default-volumes-to-restic --schedule="@every 24h"
}

install_velero ${CLUSTER_REGION}

create_schedules enedis-testing
create_schedules orderer-testing
create_schedules producer-testing
create_schedules rte-testing

create_schedules enedis-staging
create_schedules orderer-staging
create_schedules producer-staging
create_schedules rte-staging