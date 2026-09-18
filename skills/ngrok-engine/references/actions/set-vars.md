# `set-vars`

**Generated from ngrok's published documentation - do not hand-edit.**

Set custom variables for use in your traffic policy.

- **Phases:** `on_http_request`, `on_http_response`, `on_tcp_connect`
- **Ends chain:** no
- **Categories:** request-modification, response-modification, connection-modification

## Configuration

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `vars` | array of map[string]any | yes | List of maps that have a key of string and a value of any valid CEL type Each map must be of exactly size `1`, and represents one variable where the key is the name of the variable: |

### Field details

**`vars`**

List of maps that have a key of string and a value of any valid CEL type Each map must be of exactly size `1`, and represents one variable where the key is the name of the variable:

```yaml
vars:
  - variable_a: value
  - variable_b: value
```

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
                    - value2
    - expressions:
        - vars.sample_bool == true
      actions:
        - type: custom-response
          config:
            status_code: 200
            headers:
              content-type: text/plain
            body: ${vars.sample_string} ${vars.sample_double} ${vars.sample_list[0]} ${vars.sample_map.key} ${vars.sample_nested_map.key[1]}

```

Docs: <https://ngrok.com/docs/gateway/traffic-policy/actions/set-vars>
