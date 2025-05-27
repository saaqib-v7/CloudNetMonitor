# CloudNetMonitor Helm Chart

This Helm chart deploys the CloudNetMonitor application on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
$ helm repo add bitnami https://charts.bitnami.com/bitnami
$ helm dependency update
$ helm install my-release .
```

## Configuration

The following table lists the configurable parameters of the CloudNetMonitor chart and their default values.

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.imageRegistry` | Global Docker image registry | `""` |
| `global.imagePullSecrets` | Global Docker registry secret names | `[]` |

### Frontend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.image.repository` | Frontend image repository | `cloudnetmonitor/frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `frontend.service.type` | Frontend service type | `LoadBalancer` |
| `frontend.resources` | Frontend resource requests/limits | See `values.yaml` |

### Backend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.image.repository` | Backend image repository | `cloudnetmonitor/backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.replicaCount` | Number of backend replicas | `2` |
| `backend.service.type` | Backend service type | `ClusterIP` |
| `backend.resources` | Backend resource requests/limits | See `values.yaml` |

### Simulator Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `simulator.image.repository` | Simulator image repository | `cloudnetmonitor/simulator` |
| `simulator.image.tag` | Simulator image tag | `latest` |
| `simulator.replicaCount` | Number of simulator replicas | `1` |
| `simulator.resources` | Simulator resource requests/limits | See `values.yaml` |

## Upgrading

### To 1.0.0

No special actions needed for the first release. 