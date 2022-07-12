A few commands to run to configure a kubernetes cluster:

## Install prometheus crds

~~~bash
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_alertmanagerconfigs.yaml
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_alertmanagers.yaml
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_podmonitors.yaml
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_probes.yaml
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_prometheuses.yaml
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_prometheusrules.yaml
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.50.0/example/prometheus-operator-crd/monitoring.coreos.com_thanosrulers.yaml
~~~

## Install nginx ingress

~~~bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm upgrade --install --create-namespace --wait ingress-nginx ingress-nginx/ingress-nginx --namespace ingress --version v4.1.4 --values ingress.yaml
~~~

# Install cert-manager

~~~bash
helm repo add jetstack https://charts.jetstack.io
helm upgrade --install --create-namespace --wait cert-manager jetstack/cert-manager --namespace cert-manager --version v1.8.0 --values cert-manager.yaml
~~~

# Install reloader

~~~bash
helm repo add stakater https://stakater.github.io/stakater-charts
helm upgrade --install --create-namespace --wait reloader stakater/reloader --namespace reloader --version v0.0.99 --values reloader.yaml
~~~

# Install prometheus

~~~bash
helm upgrade --install --create-namespace --wait kube-prometheus-stack kube-prometheus-stack --namespace monitoring --version v18.0.2 --repo https://prometheus-community.github.io/helm-charts --values prometheus.yaml
~~~

# Install loki

~~~bash
helm upgrade --install --create-namespace --wait loki loki-stack --namespace logging --version 2.4.1 --repo https://grafana.github.io/helm-charts --values loki.yaml --set loki.config.storage_config.azure.account_key=<KEY>
~~~

# Install velero
