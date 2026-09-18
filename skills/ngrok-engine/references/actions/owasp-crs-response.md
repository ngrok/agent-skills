# `owasp-crs-response`

**Generated from ngrok's published documentation - do not hand-edit.**

Add OWASP CoreRuleSet to outgoing HTTP responses from your endpoints.

- **Phases:** `on_http_response`
- **Ends chain:** no
- **Categories:** security, traffic-control, response-modification

## Configuration

None.

## Result variables

Readable from `expressions` in later rules once this action has run.

- `actions.ngrok.owasp_crs_response.decision` (string)
- `actions.ngrok.owasp_crs_response.anomaly_score` (int)
- `actions.ngrok.owasp_crs_response.anomaly_score_threshold` (int)
- `actions.ngrok.owasp_crs_response.matched_rules` (array of objects)
- `actions.ngrok.owasp_crs_response.matched_rules[i].id` (int)
- `actions.ngrok.owasp_crs_response.matched_rules[i].message` (string)
- `actions.ngrok.owasp_crs_response.matched_rules[i].severity` (string)
- `actions.ngrok.owasp_crs_response.matched_rules[i].data` (string)
- `actions.ngrok.owasp_crs_response.error.code` (string)
- `actions.ngrok.owasp_crs_response.error.message` (string)

## Example

```yaml
  on_http_response:
    - actions:
        - type: owasp-crs-response
          config:
            on_error: halt

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/owasp-crs-response>
