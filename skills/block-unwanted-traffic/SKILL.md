---
name: block-unwanted-traffic
description: Block unwanted traffic on an ngrok endpoint using Traffic Policy and IP Intelligence. Generates or extends a traffic-policy.yml for scanners, anonymous proxies and VPNs, and country-based blocking. Use when asked to block, deny, restrict, or filter traffic by IP, country, proxy, VPN, Tor, or scanner.
license: MIT
metadata:
  author: ngrok
  version: "1.0"
compatibility: Requires ngrok CLI. Cloud endpoint updates also require an ngrok API key.
---

# Block Unwanted Traffic

Generate or extend an ngrok Traffic Policy that blocks scanners, anonymous proxies (including Tor and named VPNs), and traffic from specific countries, using ngrok's built-in IP Intelligence categories and geo data.

This skill writes policy files. It doesn't start tunnels. Pair it with `expose-localhost` (which starts the tunnel) or an existing cloud endpoint.

## Prerequisites

- ngrok CLI installed (`ngrok` command available)
- For cloud-endpoint updates only: an ngrok API key (`ngrok config add-api-key <KEY>`, get one at https://dashboard.ngrok.com/api-keys)

## Workflow

### Step 1: Detect existing state

Silently check for existing policy state before asking questions:

1. Look for `.ngrok/traffic-policy.yml` in the project root. Also check `traffic-policy.yaml`, `ngrok-policy.yml`, and any path the user has already mentioned.
2. If the user references a cloud endpoint by URL or ID, hold off and confirm with them before running any `ngrok api` commands.

### Step 2: Ask all questions upfront

Before asking anything, print the notices relevant to what the user is likely to pick:

> Anonymous proxy blocking trades privacy for noise reduction. The `proxy.anonymous` category covers Tor exit nodes and VPN IPs that privacy-conscious legitimate users rely on, not just attackers. That's fine for most B2C apps. It's a real problem for human-rights tools, whistleblower forms, or anywhere anonymity is a feature.

> Geo blocking has sharp edges. Accuracy is radius-level, often 50km or worse. VPNs defeat it trivially. You can accidentally block CDN points of presence, mobile carriers, or corporate VPNs that route through unexpected countries. Watch the traffic inspector after you roll it out so you catch false positives early.

Then ask everything before you write anything. Use a single plain list, not bolded labels:

```
A few quick questions before I write the policy:

1. What should I block? Pick any that apply:
   - Known scanners like Censys and CCBot. Lowest false-positive risk.
   - Anonymous proxies, Tor, and named VPNs.
   - Traffic from specific countries.

2. Where should this policy live?
   - A new .ngrok/traffic-policy.yml.
   - Append to the existing policy at <PATH>.
   - Update the policy on an existing cloud endpoint. Requires an API key.
```

If the user picks country blocking, ask for two-letter ISO codes like `RU`, `CN`, `KP`.

If the user picks anonymous proxies, ask which shape:

- All anonymous proxies, the broadest option. Covers Tor, the Firehol anonymous list, and others.
- Tor exit nodes only.
- Specific named VPNs: Mullvad, NordVPN, Private Internet Access.

Confirm the answers with a Y/n before you write.

### Step 3: Generate the policy rule(s)

Emit one rule per pattern under `on_http_request`. Use `status_code: 403` for deny unless the user asks for `404` (which hides that the endpoint exists).

#### Block known scanners

```yaml
on_http_request:
  - expressions:
      - "'io.censys.scanners' in conn.client_ip.categories || 'org.commoncrawl.ccbot' in conn.client_ip.categories"
    actions:
      - type: deny
        config:
          status_code: 403
```

Add more scanner categories from the full list if the user names them (see `references/CATEGORIES.md`).

#### Block all anonymous proxies (including Tor)

```yaml
on_http_request:
  - expressions:
      - "'proxy.anonymous' in conn.client_ip.categories"
    actions:
      - type: deny
        config:
          status_code: 403
```

The `proxy.anonymous` category is hierarchical. It matches `proxy.anonymous.tor`, `proxy.anonymous.org.firehol`, and every sub-category.

#### Block Tor exit nodes only

```yaml
on_http_request:
  - expressions:
      - "'proxy.anonymous.tor' in conn.client_ip.categories"
    actions:
      - type: deny
        config:
          status_code: 403
```

#### Block specific named VPN providers

```yaml
on_http_request:
  - expressions:
      - "'proxy.vpn.mullvad' in conn.client_ip.categories || 'proxy.vpn.nordvpn' in conn.client_ip.categories || 'proxy.vpn.pia' in conn.client_ip.categories"
    actions:
      - type: deny
        config:
          status_code: 403
```

#### Block traffic from specific countries

```yaml
on_http_request:
  - expressions:
      - "conn.client_ip.geo.location.country_code in ['RU', 'CN', 'KP']"
    actions:
      - type: deny
        config:
          status_code: 403
```

Replace the list with the user's ISO codes. For OFAC-style compliance, also consider checking `conn.client_ip.geo.registered_location.country_code` (the IP's registered country, which can differ from its current location).

### Step 4: Write or merge

For a new file, write the full policy with a single `on_http_request:` key and all rules under it:

```bash
mkdir -p .ngrok
# then write the policy to .ngrok/traffic-policy.yml
```

For an existing local file, read it, append the new rules under the existing `on_http_request:` list (without overwriting other rules or other phases), and write it back. Preserve comments and key order where reasonable.

For a cloud endpoint, confirm with the user before you run any API command:

```bash
# Find the endpoint
ngrok api endpoints list

# Fetch the current policy
ngrok api endpoints get <ENDPOINT_ID> --format json | jq -r '.traffic_policy'

# Merge locally, show the diff to the user, get Y/n, then update
ngrok api endpoints update <ENDPOINT_ID> --traffic-policy "$(cat .ngrok/traffic-policy.yml)"
```

### Step 5: Tell the user what to do next

The skill wrote a file. It didn't attach the policy to a running tunnel. The user still has to start or reload the agent with the new policy. Print something like:

> Policy written to `.ngrok/traffic-policy.yml`. The rules aren't active yet. Start or reload your ngrok agent with this policy to apply them:
>
> ```bash
> ngrok http <PORT> --traffic-policy-file .ngrok/traffic-policy.yml
> ```
>
> If your agent is already running, stop it with `pkill ngrok` and restart with the `--traffic-policy-file` flag. Cloud endpoints pick up the new policy automatically after `ngrok api endpoints update`, so no agent restart is needed there.

Then move to Step 6.

### Step 6: Verify the policy is working

Be honest with the user. Most block rules can't be tested from their own machine. Their laptop's IP isn't in a scanner range, isn't a Tor exit, and isn't in a country they blocked. `curl` from it will return a normal response regardless of whether the rules work. The real verification is the dashboard.

> Open the traffic inspector: https://dashboard.ngrok.com/traffic-inspector
>
> Every request that hits your endpoint shows up here with the status code it received. Watch for the code you configured, 403 by default, on requests from the categories you blocked. If nothing is being denied after a reasonable window of real traffic, the categories probably don't match your actual traffic mix. That's not a bug.

For the two patterns the user can self-test, offer these only when relevant:

- Country or geo blocking: connect through a VPN set to a blocked country, then run `curl -I https://<ENDPOINT_URL>`. Expect a `403`.
- Tor blocking: request the URL through Tor Browser. Expect a `403`.

Don't offer a manual test for scanner or named-VPN blocking. The user would need a matching source IP that they almost certainly don't have. The traffic inspector is the answer.

## Category reference

`references/CATEGORIES.md` lists the ~10 IP categories this skill uses in its v1 examples. For the full taxonomy (50+ organizations, hundreds of categories including webhook sources, AI crawlers, and public lists), point users to https://ngrok.com/docs/traffic-policy/variables/conn.ip-intel.categories.

## Troubleshooting

### Rules don't match any traffic

Open the traffic inspector at https://dashboard.ngrok.com/traffic-inspector and check a recent request against a category you expect to block. If the request's `conn.client_ip.categories` doesn't include your category, either the category name is wrong or your traffic mix doesn't include matching IPs yet. Neither is a bug.

### Blocked a legitimate user

Narrow the category, say `proxy.anonymous.tor` instead of `proxy.anonymous`. Or add a higher-priority rule above it that allows the specific IP or category. The first matching rule wins.

### Cloud endpoint update returns an auth error

Confirm the API key has edit scope and that the account plan supports the actions in the policy.

## Out of scope for this skill

These are intentional non-goals. Point users to the docs instead:

- Allowlisting webhook sources like GitHub, Stripe, AWS SNS. The inverse pattern needs a different flow.
- AI crawler blocking for GPTBot, Perplexity, Anthropic. Category choices are opinionated and depend on SEO goals.
- AS-number filtering via `conn.client_ip.as.number`.
- TCP/TLS endpoint policies under `on_tcp_connect`.
- Rate-limit tuning. The `expose-localhost` skill sets a sensible default.
