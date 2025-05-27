{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cloudnetmonitor.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cloudnetmonitor.labels" -}}
helm.sh/chart: {{ include "cloudnetmonitor.chart" . }}
{{ include "common.labels.standard" . }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cloudnetmonitor.selectorLabels" -}}
{{ include "common.labels.matchLabels" . }}
{{- end }} 