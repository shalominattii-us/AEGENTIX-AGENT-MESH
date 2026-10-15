@echo off
title TensorAgent OS - Bootloader
cd /d "C:\TensorAgentOS"

echo ==============================================================================
echo                TENSORAGENT OS (x86_64) - BARE-METAL AGENT VM
echo ==============================================================================
echo  Base System: Debian Bookworm + OpenWhale AI Engine + WhaleOS
echo  Hardware Target: 8GB RAM, 6 Cores, WHPX Hardware Acceleration
echo  Forwarded Ports:
echo    - Host: 7777 -^> Guest: 7777 (WhaleOS Web/API Dashboard)
echo    - Host: 2222 -^> Guest: 22 (SSH Terminal)
echo  Default Login: ainux / ainux
echo ==============================================================================
echo.

set QEMU_PATH="C:\Program Files\qemu\qemu-system-x86_64.exe"
if not exist %QEMU_PATH% (
    set QEMU_PATH=qemu-system-x86_64.exe
)

if not exist "tensoragent-disk.qcow2" (
    echo [*] Creating 64GB persistent virtual hard drive...
    "C:\Program Files\qemu\qemu-img.exe" create -f qcow2 tensoragent-disk.qcow2 64G
)

echo [*] Launching TensorAgent OS...
%QEMU_PATH% ^
  -m 8192 ^
  -smp 6 ^
  -cpu max ^
  -accel whpx ^
  -accel tcg ^
  -cdrom "C:\TensorAgentOS\tensoragent-os-x86_64.iso" ^
  -hda "C:\TensorAgentOS\tensoragent-disk.qcow2" ^
  -boot d ^
  -net nic,model=virtio ^
  -net user,hostfwd=tcp::7777-:7777,hostfwd=tcp::2222-:22 ^
  -vga virtio ^
  -display sdl

pause
