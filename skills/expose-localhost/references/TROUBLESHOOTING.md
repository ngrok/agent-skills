# Troubleshooting

## OWASP False Positives

The OWASP Core Rule Set may block legitimate requests that look like attacks. To fix, identify the rule ID from the ngrok dashboard and exclude it:

```yaml
- type: owasp-crs-request
  config:
    on_error: halt
    exclude_rule_ids:
      - 942100  # Example: SQL injection rule
```

## OAuth Callback URL

For custom OAuth apps (not ngrok's managed providers), set the callback URL to:

```
https://idp.ngrok.com/oauth2/callback
```

Managed providers (Google, GitHub, Microsoft, GitLab, LinkedIn, Twitch) need no configuration.

## Rate Limit 429s

The default policy sets 200 requests/minute per IP. To adjust, change `capacity` in the rate-limit action and restart ngrok.
