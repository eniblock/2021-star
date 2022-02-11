controller:
  setAsDefaultIngress: true
  extraArgs:
    enable-ssl-passthrough: ""
  metrics:
    enabled: true
    serviceMonitor:
      enabled: true
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 80
    targetMemoryUtilizationPercentage: 175
  resources:
    requests:
      cpu: 100m
      memory: 150Mi
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels:
              app.kubernetes.io/name: ingress-nginx
              app.kubernetes.io/instance: ingress
          topologyKey: kubernetes.io/hostname
  config:
    proxy-body-size: 100m
    server-tokens: "false"
    use-gzip: "true"
    gzip-level: 6
    gzip-min-length: 1024
    gzip-types: >-
      application/javascript
      application/json
      application/x-javascript
      application/xml
      application/xml+rss
      text/css
      text/html
      text/javascript
      text/plain
      text/xml
