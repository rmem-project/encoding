# Security Policy

## Supported versions

`@relicmem/encoding` is in active development. Before `1.0.0`, supported versions are intentionally
narrow because breaking fixes may be needed while the API is still stabilizing.

Security fixes are targeted for:

| Version                  | Supported                                     |
| ------------------------ | --------------------------------------------- |
| Latest published release | Yes                                           |
| `main` branch            | Yes                                           |
| Older pre-1.0 releases   | Critical fixes only, at maintainer discretion |
| Deprecated releases      | No                                            |

For pre-1.0 npm releases, "latest published release" means the newest `0.x` version available on
the official npm package. Older `0.x` versions should upgrade to the latest release unless a
maintainer explicitly publishes a backport.

After `1.0.0`, this policy may be updated with an explicit supported-version window.

## Reporting a vulnerability

Please do not report security vulnerabilities through public GitHub issues, public discussions, or social media.

Supported private reporting method:

1. Open the repository on GitHub.
2. Go to the **Security** tab.
3. Use **Report a vulnerability** if private vulnerability reporting is enabled.

GitHub private vulnerability reporting is the supported security intake channel for this repository.
Maintainers should keep it enabled before accepting public releases. If the button is missing, do
not open a public issue with a placeholder request or vulnerability details. Use only a private
maintainer contact already published by the official project, or wait until private vulnerability
reporting is enabled.

## What to include

A useful vulnerability report should include:

- affected package name and version;
- affected runtime environment;
- a clear description of the issue;
- steps to reproduce;
- minimal reproduction input, if safe to share privately;
- expected behavior;
- actual behavior;
- potential impact;
- whether the vulnerability is already public;
- whether you want public credit in the advisory.

## Scope

Security issues may include, but are not limited to:

- denial-of-service risks caused by malformed input;
- excessive CPU or memory usage on untrusted input;
- crashes caused by malformed byte sequences;
- unsafe handling of generated or external encoding data;
- dependency or supply-chain vulnerabilities;
- build, release, or provenance issues;
- behavior that could lead to data corruption in security-sensitive contexts.

The following are usually not considered security vulnerabilities by themselves:

- unsupported encodings;
- normal parsing or decoding errors;
- behavior that requires trusted local code execution;
- issues in unsupported versions;
- general bugs without a plausible security impact.

If you are unsure whether something is security-sensitive, report it privately.

## Response expectations

This is a small open-source project, so these are response targets rather than guaranteed service
levels. Maintainers will make a best effort to:

- acknowledge a private report within 7 calendar days;
- provide an initial triage result or status update within 14 calendar days;
- send an update at least every 14 calendar days while the report remains open;
- investigate the issue and identify affected versions;
- avoid unnecessary public disclosure before a fix is available;
- credit the reporter when appropriate and requested;
- publish a patched release when a fix is ready;
- document relevant mitigation steps when possible.

## Coordinated disclosure

Please do not publicly disclose a vulnerability until disclosure has been coordinated with the
maintainers. The default coordinated disclosure window is up to 90 calendar days after the private
report, unless the maintainers and reporter agree on a different timeline because of active
exploitation, public prior disclosure, fix complexity, or user risk.

Before public disclosure, the expected path is:

- the maintainers have confirmed the issue;
- a fix or mitigation is available, or a no-fix rationale has been shared privately;
- users have had a reasonable opportunity to update when a release is needed;
- public advisory text avoids unnecessary exploit details before users can update.

Confirmed vulnerabilities that affect published packages should normally use a GitHub Security
Advisory. Maintainers may request a CVE through GHSA when the issue is in scope. If a report is not
treated as a vulnerability, maintainers should explain the reason privately.

## Security of dependencies and releases

Users are encouraged to:

- install packages from trusted registries;
- verify package names carefully;
- review changelogs before upgrading;
- keep dependencies up to date;
- avoid running untrusted input through privileged processes.

Official releases should be published through the configured project release process.
