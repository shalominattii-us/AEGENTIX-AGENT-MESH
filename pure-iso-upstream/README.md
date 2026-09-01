# Pure ISO Upstream Variant

This directory is the upstream intake/control plane for the Pure ISO Linux variant system.

It does **not** store hundreds of ISO binaries in Git. It stores the catalog, immutable provenance records, verification policy, and acquisition tooling. ISO payloads are staged in artifact storage and are promoted only after verification.

## Universal target contract

Every discovered Linux distribution/variant is an independent target. There are no trusted-distro bypasses.

`DISCOVER -> CLASSIFY -> ACQUIRE -> HASH -> VERIFY UPSTREAM SIGNATURE -> VERIFY CHECKSUM -> INSPECT -> ATTEST -> PROMOTE`

A target that cannot establish provenance or cryptographic integrity is quarantined.

## Security model

Prefer an upstream-signed checksum/signature pair. SHA-256 alone is an integrity check, not independent authenticity. Projects such as Kali, Fedora, Arch, Linux Mint, Void, and Grml document signed checksum verification for their release media. See the project-specific verifier adapters in `tools/`.

The acquisition system preserves the original bytes and records:

- distro and variant identity
- release/version
- architecture
- source URL and mirror URL
- acquisition timestamp
- file size
- SHA-256
- upstream checksum/signature status
- signing-key fingerprint when available
- verifier used/version
- quarantine reason when verification fails

## Staging

Default staging layout:

`pure-iso-staging/<distro>/<variant>/<release>/<arch>/`

The repository contains metadata; large ISO payloads belong in controlled artifact storage.
