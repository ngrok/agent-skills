# `owasp-crs-request`

**Generated from ngrok's published documentation - do not hand-edit.**

Add OWASP CoreRuleSet to incoming HTTP requests to your endpoints.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** security, traffic-control, request-modification

## Configuration

None.

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.owasp_crs_request.decision` (string)
- `actions.ngrok.owasp_crs_request.anomaly_score` (int)
- `actions.ngrok.owasp_crs_request.anomaly_score_threshold` (int)
- `actions.ngrok.owasp_crs_request.matched_rules` (array of objects)
- `actions.ngrok.owasp_crs_request.matched_rules[i].id` (int)
- `actions.ngrok.owasp_crs_request.matched_rules[i].message` (string)
- `actions.ngrok.owasp_crs_request.matched_rules[i].severity` (string)
- `actions.ngrok.owasp_crs_request.matched_rules[i].data` (string)
- `actions.ngrok.owasp_crs_request.error.code` (string)
- `actions.ngrok.owasp_crs_request.error.message` (string)

## Example

```yaml
  on_http_request:
    - actions:
        - type: owasp-crs-request
          config:
            on_error: halt

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/owasp-crs-request>
