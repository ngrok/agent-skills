# `set-vars`

**Generated from ngrok's published documentation - do not hand-edit.**

Set custom variables for use in your traffic policy.

- **Phases:** `on_http_request`, `on_http_response`, `on_tcp_connect`
- **Ends chain:** no
- **Categories:** request-modification, response-modification, connection-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `vars` | array of map[string]any | yes | List of maps that have a key of string and a value of any valid CEL type Each map must be of exactly size `1`, and represents one variable where the key is the name of the variable: ```yaml theme={null} vars: - variable_a: value - variable_... |

## Example

```yaml
  on_http_request:
    - actions:
        - type: set-vars
          config:
            vars:
              - sample_string: bar
              - sample_double: 1.5
              - sample_bool: true
              - sample_null: null
              - sample_list:
                  - 1
                  - 2
                  - 3
              - sample_map:
                  key: value
              - sample_nested_map:
                  key:
                    - value1
# ...truncated, see the action's docs page
```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/set-vars>
