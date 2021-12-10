{{/*
Expand the name of the chart.
*/}}
{{- define "star.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "star.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "star.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "star.labels" -}}
helm.sh/chart: {{ include "star.chart" . }}
{{ include "star.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "star.selectorLabels" -}}
app.kubernetes.io/name: {{ include "star.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "star.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "star.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create secret data with automatic initialization
Parameter: [$, Secret name, [Secret key 1, Secret key 2, ...]]
*/}}
{{- define "star.automaticSecret" -}}
{{- $ := index . 0 -}}
{{- $name := index . 1 -}}
{{- $keys := index . 2 -}}
{{- $secretLength := 20 }}
{{- if ($.Values.global).dev }}
{{- range $keys }}
{{ . }}: {{ printf "%s-%s" $name . | sha256sum | trunc $secretLength | b64enc | quote }}
{{- end }}
{{- else if and ($.Release.IsUpgrade) (lookup "v1" "Secret" $.Release.Namespace $name) }}
{{- range $keys }}
{{ . }}: {{ index (lookup "v1" "Secret" $.Release.Namespace $name).data . }}
{{- end }}
{{- else }}
{{- range $keys }}
{{ . }}: {{ randAlphaNum $secretLength | b64enc | quote }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Keycloak fullname
*/}}
{{- define "star.keycloak.fullname" -}}
{{- if .Values.keycloak.fullnameOverride }}
{{- .Values.keycloak.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.keycloak.nameOverride }}
{{- if eq $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}
