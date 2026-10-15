# TensorAgent OS (x86_64) — Local Installation & Boot Kit

**TensorAgent OS** is the world's first AI-native, agentic operating system where the AI agent is the primary interface with native kernel, hardware, filesystem, and systemd access.

- **ISO Location**: `C:\TensorAgentOS\tensoragent-os-x86_64.iso`
- **File Size**: 2,136,616,960 bytes (2.13 GB)
- **SHA256**: `599BFB9765677EB0E5256999ABCACCF886C6FA8B945C7C340F1B8158E67EFD3B` (Verified against GitHub upstream)
- **Default Login**: `ainux` / `ainux`

---

## What Is Included in This Distribution

- **AI Engine**: OpenWhale Multi-Agent Tool & MCP Engine
- **Desktop Shell**: WhaleOS Qt6 Shell
- **Kernel & Base**: Debian Bookworm x86_64
- **Runtime Stack**: Node.js 22, Python 3.12, SQLite
- **Agent Browser**: Headless WebMCP-enabled Chromium
- **Ports Forwarded**:
  - `Host: 7777` -> `Guest: 7777` (WhaleOS Web / Agent API Dashboard)
  - `Host: 2222` -> `Guest: 22` (Direct SSH Terminal)

---

## Booting TensorAgent OS

### Method 1: QEMU (Recommended for Quick Local Boot)
1. Run `C:\TensorAgentOS\qemu-setup.exe` to install QEMU for Windows.
2. Double-click `C:\TensorAgentOS\boot-tensoragent-qemu.bat`.
   - It automatically provisions a 64GB persistent `.qcow2` virtual drive.
   - Allocates 8GB RAM and 6 CPU cores with hardware hypervisor acceleration.
   - Forwards ports `7777` (dashboard) and `2222` (SSH).

### Method 2: VirtualBox / VMware Workstation
1. Create a New VM:
   - Type: `Linux`
   - Version: `Debian (64-bit)`
   - Memory: `8192 MB` (8 GB)
   - Processors: `4` to `6` Cores
   - Firmware: `EFI Enabled`
2. Attach Optical Drive:
   - Select `C:\TensorAgentOS\tensoragent-os-x86_64.iso`.
3. Create Virtual Disk: `64 GB` (VDI or VMDK).
4. Boot the VM.
   > **Note**: If the VM pauses at the EFI shell or first boot takes long, power off and cold-restart once — first boot runs cloud-init hardware auto-configuration.

### Method 3: Bare Metal Flash (Live USB Drive)
To boot directly on your AMD Ryzen AI Z2 Extreme hardware without Windows in the middle:
1. Insert a USB flash drive (8GB+).
2. Use **Rufus** (or `dd`):
   - Device: Your USB drive
   - Boot selection: `C:\TensorAgentOS\tensoragent-os-x86_64.iso`
   - Partition scheme: `GPT` / Target: `UEFI`
3. Restart PC, enter BIOS/Boot menu, select the USB drive, and boot into TensorAgent OS.
