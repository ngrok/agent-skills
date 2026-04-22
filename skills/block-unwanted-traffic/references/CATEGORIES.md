# IP categories used by this skill

These are the categories the skill reaches for by default. ngrok IP Intelligence categories are **hierarchical**. Matching `proxy.anonymous` also matches `proxy.anonymous.tor`, `proxy.anonymous.org.firehol`, and any other sub-category. Use the parent to cast a wide net, or the leaf when you want precision.

For the full taxonomy of 50+ organizations covering webhook sources, AI crawlers, CDNs, cloud providers, and public blocklists, see the canonical doc:

https://ngrok.com/docs/traffic-policy/variables/conn.ip-intel.categories

## Scanners

| Category | What it matches |
| --- | --- |
| `io.censys.scanners` | Censys continuous IPv4 scanner IPs |
| `org.commoncrawl.ccbot` | Common Crawl's CCBot |

## Anonymous proxies and Tor

| Category | What it matches |
| --- | --- |
| `proxy.anonymous` | Parent. Matches Tor, the Firehol anonymous list, and any other anonymous proxy sub-category. |
| `proxy.anonymous.tor` | Tor exit nodes only |
| `proxy.anonymous.org.firehol` | Firehol's aggregated anonymous IP list |
| `proxy.open.org.firehol` | Firehol's open proxies list |

## Named VPN providers

| Category | What it matches |
| --- | --- |
| `proxy.vpn.mullvad` | Mullvad VPN server IPs |
| `proxy.vpn.nordvpn` | NordVPN server IPs |
| `proxy.vpn.pia` | Private Internet Access VPN server IPs |

## Known-bad blocklists

These are opt-in, not part of the default flow. Use them when the user explicitly asks for aggressive blocking. The lowest false-positive option is Spamhaus DROP.

| Category | What it matches |
| --- | --- |
| `blocklist.org.spamhaus.drop.ipv4` | Spamhaus DROP (Don't Route Or Peer), IPv4 |
| `blocklist.org.spamhaus.drop.ipv6` | Spamhaus DROP, IPv6 |
| `blocklist.org.firehol.level_1` | Firehol level 1. Curated to have no false positives. |

## Geo variables

Geo blocking uses variables under `conn.client_ip.geo`, not `conn.client_ip.categories`:

| Variable | Type | Notes |
| --- | --- | --- |
| `conn.client_ip.geo.location.country_code` | string | Two-letter ISO. Where the IP currently resolves. |
| `conn.client_ip.geo.registered_location.country_code` | string | Where the IP range is registered. Can differ for CDNs, cloud providers, and mobile carriers. |
| `conn.client_ip.geo.location.is_eu` | boolean | Convenience flag. |

For OFAC-style compliance, check both `geo.location.country_code` and `geo.registered_location.country_code`. They can disagree.
