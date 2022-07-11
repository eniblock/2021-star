loki:
  config:
    auth_enabled: true
    storage_config:
      boltdb_shipper:
        active_index_directory: /data/loki/index
        cache_location: /data/loki/boltdb-cache
        cache_ttl: 24h
        shared_store: s3
      aws:
        s3: s3://${s3_key}:${s3_secret}@storage.${container_region}.cloud.ovh.net/loki
        region: ${container_region}
        s3forcepathstyle: true
    schema_config:
      configs:
        - from: 2020-07-01
          store: boltdb-shipper
          object_store: aws
          schema: v11
          index:
            prefix: index_
            period: 24h
  resources:
    requests:
      cpu: 25m
      memory: 64Mi

promtail:
  pipelineStages:
    - cri: {}
    - tenant:
        source: namespace
  resources:
    requests:
      cpu: 25m
      memory: 64Mi
