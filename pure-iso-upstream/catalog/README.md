# Catalog

The catalog is intentionally data-driven. Populate `targets.json` from authoritative upstream release indexes rather than hard-coding a finite distro list.

A target is not considered acquired or secure merely because it appears in the catalog. Acquisition and verification produce separate provenance records.

For projects that publish signed checksum files, the intake should retain both the checksum and its detached/cleartext signature. Arch, Fedora, Kali, Linux Mint, Void and Grml are examples of projects documenting this model. Upstream verification policy is authoritative per target; the Pure ISO system adds an independent SHA-256 record after acquisition.
