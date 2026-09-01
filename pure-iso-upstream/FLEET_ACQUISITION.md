# Pure ISO Upstream Fleet Acquisition

This repository is the **upstream variant control plane**. ISO binaries are acquired into external artifact storage; Git contains manifests, provenance, verification records, and acquisition automation.

## Fleet invariant

Every discovered distro/variant is a target. No trusted-distro bypass exists.

`discover -> resolve official source -> download -> verify upstream evidence -> compute SHA-256 -> quarantine/promote`

A target is **PROMOTED** only when the upstream source is reachable and integrity/authenticity evidence is present and valid. Unknown or unverifiable media is **QUARANTINED**, never silently accepted.

## Catalog scope

The acquisition engine consumes a broad Linux distribution inventory and normalizes it into target records. A current public Linux Association catalog reports 569 distributions; the project also supports larger/historical inventories by retaining targets whose media are no longer available. Catalog count is not treated as proof that an ISO exists.

## Storage rule

Do not commit ISO binaries to Git. Store binaries in object storage or a controlled filesystem and commit the immutable manifest containing source URL, retrieved timestamp, byte size, SHA-256, upstream verification evidence, architecture, and promotion state.

## Required target states

`DISCOVERED`, `SOURCE_RESOLVED`, `DOWNLOADED`, `VERIFIED`, `PROMOTED`, `QUARANTINED`, `RETIRED`.
