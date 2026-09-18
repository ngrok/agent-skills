# `owasp-crs-request`

**Generated from ngrok's published documentation - do not hand-edit.**

Add OWASP CoreRuleSet to incoming HTTP requests to your endpoints.

- **Phases:** `on_http_request`
- **Ends chain:** no
- **Categories:** security, traffic-control, request-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `on_error` | string | yes | Behavior if there is an error processing rules. Must be one of either `"continue"` or `"halt"` (default `"halt"`). More information can be found in the Managing Fallback Behavior section. |
| `process_body` | bool | no | If `true`, rules for the request body are evaluated. Default is `false`. See Body Processing for details and limitations. |
| `exclude_rule_ids` | array of integers | no | List of OWASP CRS rule IDs to exclude from evaluation. The minimum value is `900000` and the maximum value is `999999`. |

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
