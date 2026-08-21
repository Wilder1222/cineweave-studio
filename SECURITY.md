# Security Policy

## Supported versions

Security fixes are applied to the latest released CineWeave Studio version.
Older development snapshots are not supported after a replacement release is
available.

## Reporting

Report suspected credential exposure, path traversal, unsafe plugin packaging,
rights-gate bypasses or artifact-integrity failures privately to
wangwilder1222@gmail.com. Do not include private media, API keys, signed URLs or
personal data in a public issue.

Include the affected version, reproduction steps, expected boundary and the
smallest non-sensitive fixture that demonstrates the problem. The maintainer
will confirm receipt, assess severity and coordinate disclosure before a public
fix note is published.

## Security boundaries

CineWeave Skills and the local runtime do not grant provider credentials,
commercial media rights or permission to publish a person's likeness. Unknown
rights block production readiness. Artifact content hashes detect accidental or
unauthorized mutation; they are not signatures and do not establish authorship.

Project bundles accept only a fixed set of `.cineweave` store paths and regular
files. Verification rejects symbolic links, traversal syntax, duplicate or
unexpected entries, byte-length/hash changes and an existing import target.
This protects the local transfer workflow from accidental overwrite and common
archive-style path attacks; it does not authenticate the bundle author. Use a
separate trusted signature channel when sender authenticity is required.
