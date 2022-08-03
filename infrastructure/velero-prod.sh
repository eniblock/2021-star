#!/bin/bash

function install_velero {
    velero install \
      --provider azure \
      --plugins velero/velero-plugin-for-microsoft-azure:v1.5.0 \
      --bucket velero \
      --secret-file ./creds-azure \
      --backup-location-config resourceGroup=star-aks-rg,storageAccount=starvelero,storageAccountKeyEnvVar=AZURE_STORAGE_ACCOUNT_ACCESS_KEY \
      --restic-pod-cpu-request 100m \
      --use-restic
      #--snapshot-location-config apiTimeout=5m,resourceGroup=star-aks-rg \
}

function create_schedules {
    velero schedule create rte-prod-1h --ttl 24h --include-namespaces rte-prod --default-volumes-to-restic --schedule="@every 1h"
    velero schedule create rte-prod-6h --ttl 168h --include-namespaces rte-prod --default-volumes-to-restic --schedule="@every 6h"
    velero schedule create rte-prod-24h --include-namespaces rte-prod --default-volumes-to-restic --schedule="@every 24h"
}

install_velero
#kubectl -n velero patch backupstoragelocation default --type='json' -p='[{"op": "add", "path": "/spec/config/storageAccountKeyEnvVar", "value": "AZURE_STORAGE_ACCOUNT_ACCESS_KEY"}]'
create_schedules

