alertmanager:
  enabled: false

prometheus:
  prometheusSpec:
    retention: 30d
    # https://github.com/prometheus-operator/kube-prometheus/pull/16
    additionalScrapeConfigs:
      - job_name: kubernetes-pods
        kubernetes_sd_configs:
        - role: pod
        relabel_configs:
        - action: keep
          regex: true
          source_labels:
          - __meta_kubernetes_pod_annotation_prometheus_io_scrape
        - action: replace
          regex: (https?)
          source_labels:
          - __meta_kubernetes_pod_annotation_prometheus_io_scheme
          target_label: __scheme__
        - action: replace
          regex: (.+)
          source_labels:
          - __meta_kubernetes_pod_annotation_prometheus_io_path
          target_label: __metrics_path__
        - action: replace
          regex: ([^:]+)(?::\d+)?;(\d+)
          replacement: $1:$2
          source_labels:
          - __address__
          - __meta_kubernetes_pod_annotation_prometheus_io_port
          target_label: __address__
        - action: labelmap
          regex: __meta_kubernetes_pod_label_(.+)
        - action: replace
          source_labels:
          - __meta_kubernetes_namespace
          target_label: kubernetes_namespace
        - action: replace
          source_labels:
          - __meta_kubernetes_pod_name
          target_label: kubernetes_pod_name
        - action: drop
          regex: Pending|Succeeded|Failed|Completed
          source_labels:
          - __meta_kubernetes_pod_phase
    additionalAlertManagerConfigs:
      - scheme: https
        basic_auth:
          username: ${alerting_username}
          password: ${alerting_password}
        static_configs:
          - targets:
              - monitoring.bxdev.tech
    externalLabels:
      app: ${app_name}
      env: ${environment}
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          storageClassName: csi-cinder-high-speed
          resources:
            requests:
              storage: 30Gi
    resources:
      requests:
        cpu: 200m
        memory: 1Gi
    podMetadata:
      annotations:
        "cluster-autoscaler.kubernetes.io/safe-to-evict": "true"
    serviceMonitorSelectorNilUsesHelmValues: false

prometheusOperator:
  resources:
    requests:
      cpu: 25m
      memory: 75Mi

grafana:
  podAnnotations:
    "cluster-autoscaler.kubernetes.io/safe-to-evict": "true"
  ingress:
    enabled: true
    pathType: ImplementationSpecific
    annotations:
      kubernetes.io/tls-acme: "true"
    hosts:
      - ${domain}
    tls:
      - hosts:
        - ${domain}
        secretName: ${app_name}-${environment}-grafana-cert
  service:
    type: NodePort
  adminPassword: "${grafana_admin_password}"
  grafana.ini:
    server:
      root_url: https://${domain}/grafana
      serve_from_sub_path: true
      enable_gzip: true
  persistence:
    enabled: true
    accessModes: ["ReadWriteOnce"]
    size: 1Gi
  additionalDataSources:
    - name: loki
      access: proxy
      editable: false
      orgId: 1
      type: loki
      url: http://loki.logging:3100
      version: 1
  resources:
    requests:
      cpu: 50m
      memory: 128Mi
  deploymentStrategy:
    type: Recreate

prometheus-node-exporter:
  resources:
    requests:
      cpu: 50m
      memory: 25Mi

# GKE using kube-dns
coreDns:
  enabled: false

kubeDns:
  enabled: true

# Not running on nodes (only master)
kubeScheduler:
  enabled: false

# Not running on nodes (only master)
kubeControllerManager:
  enabled: false

kube-state-metrics:
  resources:
    requests:
      cpu: 25m
      memory: 64Mi
