# Kubernetes Operator

Source of truth: <https://ngrok.com/docs/gateway/k8s/>

Exposes ngrok through Kubernetes-native resources. You can use standard Gateway API
objects or ngrok's CRDs.

Authenticate the operator with an ngrok **API key and an agent authtoken** - it needs
both.

**TCP endpoints are not supported by the operator.** If the user needs TCP (SSH, RDP,
a database) on Kubernetes, say so early.

## The common shape

An internal `AgentEndpoint` for each upstream service, and a `CloudEndpoint` for the
public hostname that routes to them. The cloud endpoint is where account-wide
concerns live (auth, rate limits); the agent endpoints are where services attach.

```yaml
apiVersion: ngrok.k8s.ngrok.com/v1alpha1
kind: AgentEndpoint
metadata:
  name: foo-service
  namespace: default
spec:
  url: http://foo-service.internal:80
  upstream:
    url: http://foo-service.example-namespace:8080
  bindings:
    - internal
```

```yaml
apiVersion: ngrok.k8s.ngrok.com/v1alpha1
kind: CloudEndpoint
metadata:
  name: example-cloud-endpoint
spec:
  url: https://example-hostname.ngrok.app
  bindings:
    - public
  trafficPolicy:
    policy:
      on_http_request:
        - expressions:
            - "req.url.path.startsWith('/foo-service')"
          actions:
            - type: forward-internal
              config:
                url: http://foo-service.internal:80
```

## Standalone policy resource

Policy can also live in its own `NgrokTrafficPolicy` object and be referenced from a
route or ingress:

```yaml
apiVersion: ngrok.k8s.ngrok.com/v1alpha1
kind: NgrokTrafficPolicy
metadata:
  name: verify-and-forward
spec:
  policy:
    on_http_request:
      - actions:
          - type: verify-webhook
            config:
              provider: stripe
              secret: "${secrets.get('webhooks', 'stripe-signing-secret')}"
```

## Kubernetes bindings

A `kubernetes` binding makes an endpoint addressable only inside clusters running the
operator. The operator creates a `v1.Service` for it, named from the URL's hostname:
`http://webapp-cust1.acme-customers` creates Service `webapp-cust1` in namespace
`acme-customers`.
