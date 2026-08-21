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

Reference ingestion allow-lists PNG, JPEG, WebP, MP4/M4V, MOV and WebM; checks
the filename extension against a bounded signature/container probe; applies
byte and image-dimension limits; writes generated content-addressed names; and
keeps stored blobs non-executable. It does not invoke media decoders or active
content. Source paths and original filenames are not retained in semantic
records.

The probe is not a malware scan, a full media validity check or a content-safety
classifier. Original bytes are retained and embedded metadata is preserved but
uninspected, so EXIF location, private metadata and malicious parser payloads
may still exist. Review or derive a metadata-stripped copy before external
transfer, and scan untrusted media with an independently maintained security
tool when the threat model requires it.

SHA-256 establishes byte identity only. Content Credentials/C2PA validation,
signer trust, copyright, license scope, likeness consent, training permission,
publication and redistribution are separate decisions. The core records these
states but does not claim C2PA certification or grant rights by ingestion.

Project bundles accept only a fixed set of `.cineweave` store paths and regular
files, including content-addressed reference blobs in V2.4 bundles. Verification
rejects symbolic links, traversal syntax, duplicate or unexpected entries,
byte-length/hash changes and an existing import target.
This protects the local transfer workflow from accidental overwrite and common
archive-style path attacks; it does not authenticate the bundle author. Use a
separate trusted signature channel when sender authenticity is required.
