#!/bin/bash

# ./velero install \
#   --provider aws \
#   --plugins velero/velero-plugin-for-aws:v1.4.1 \
#   --bucket velero \
#   --secret-file ./creds \
#   --backup-location-config region=sbg,s3ForcePathStyle="true",s3Url=https://s3.sbg.cloud.ovh.net \
#   --use-restic \
#   --use-volume-snapshots=false

function create_schedules {
    ENV=$1
    ./velero schedule create ${ENV}-1h --ttl 24h --include-namespaces ${ENV} --default-volumes-to-restic --schedule="@every 1h"
    ./velero schedule create ${ENV}-6h --ttl 168h --include-namespaces ${ENV} --default-volumes-to-restic --schedule="@every 6h"
    ./velero schedule create ${ENV}-24h --include-namespaces ${ENV} --default-volumes-to-restic --schedule="@every 24h"
}

create_schedules enedis-staging
create_schedules orderer-staging
create_schedules producer-staging
create_schedules rte-staging
