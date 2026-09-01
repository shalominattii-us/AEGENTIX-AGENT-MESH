# Fleet Catalog

`fleet.json` is generated, not hand-curated.

The acquisition system treats the Linux distribution inventory as an **open target set**. Current public inventories already enumerate hundreds of distributions; one current catalog reports 569 entries. Historical and inactive targets may also remain represented when the upstream media is archived.

Each record represents a discovered distribution identity, not a claim that current ISO media exists.

Required promotion evidence:

- official project source
- exact media URL
- release/version
- architecture
- byte size
- upstream checksum and/or cryptographic signature
- locally computed SHA-256
- retrieval timestamp
- verification result
- artifact storage location

Missing source, missing integrity evidence, failed verification, or ambiguous identity produces `QUARANTINED`.

No distro is silently omitted because it is difficult to acquire.