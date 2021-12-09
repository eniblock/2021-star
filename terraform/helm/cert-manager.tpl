installCRDs: true
ingressShim:
  defaultIssuerName: letsencrypt-prod
  defaultIssuerKind: ClusterIssuer

resources:
  requests:
    cpu: 25m
    memory: 64Mi

cainjector:
  resources:
    requests:
      cpu: 25m
      memory: 64Mi

webhook:
  resources:
    requests:
      cpu: 25m
      memory: 64Mi
