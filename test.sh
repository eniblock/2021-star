CLUSTER_REGION=$1

function restore_backup_storage {
    ENV=$1
    [ "$ENV" = "sbg" ] && RESTORE_ENV="gra"
    [ "$ENV" = "gra" ] && RESTORE_ENV="sbg"
    velero backup-location create restore \
    --provider aws  \
    --bucket velero  \
    --config region=${RESTORE_ENV} \
    --config s3Url=https://s3.${RESTORE_ENV}.cloud.ovh.net \
    --access-mode ReadOnly 
}

restore_backup_storage ${CLUSTER_REGION}