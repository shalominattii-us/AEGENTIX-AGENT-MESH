@echo off
title TensorAgent OS - VirtualBox Automated Provisioner
cd /d "C:\TensorAgentOS"

echo ==============================================================================
echo             TENSORAGENT OS - VIRTUALBOX AUTOMATED PROVISIONER
echo ==============================================================================
echo.

set VBOX_PATH="C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
if not exist %VBOX_PATH% (
    set VBOX_PATH=VBoxManage.exe
)

echo [*] Checking for VirtualBox...
%VBOX_PATH% --version >nul 2>&1
if errorlevel 1 (
    echo [!] VirtualBox not detected in Program Files or PATH.
    echo [*] Please install VirtualBox first: winget install Oracle.VirtualBox
    pause
    exit /b 1
)

echo [*] Registering TensorAgentOS Virtual Machine...
%VBOX_PATH% createvm --name "TensorAgentOS" --ostype "Debian_64" --register

echo [*] Configuring Hardware: 8GB RAM, 6 Cores, EFI Boot...
%VBOX_PATH% modifyvm "TensorAgentOS" --memory 8192 --cpus 6 --firmware efi --vram 128 --graphicscontroller vmsvga

echo [*] Creating Storage Controllers...
%VBOX_PATH% storagectl "TensorAgentOS" --name "SATA" --add sata --controller IntelAhci --bootable on

if not exist "tensoragent-disk.vdi" (
    echo [*] Creating 64GB persistent virtual drive...
    %VBOX_PATH% createmedium disk --filename "C:\TensorAgentOS\tensoragent-disk.vdi" --size 65536 --format VDI
)

echo [*] Attaching Virtual Disk and ISO...
%VBOX_PATH% storageattach "TensorAgentOS" --storagectl "SATA" --port 0 --device 0 --type hdd --medium "C:\TensorAgentOS\tensoragent-disk.vdi"
%VBOX_PATH% storageattach "TensorAgentOS" --storagectl "SATA" --port 1 --device 0 --type dvddrive --medium "C:\TensorAgentOS\tensoragent-os-x86_64.iso"

echo [*] Configuring NAT Port Forwarding (7777 -^> Dashboard, 2222 -^> SSH)...
%VBOX_PATH% modifyvm "TensorAgentOS" --nic1 nat
%VBOX_PATH% modifyvm "TensorAgentOS" --natpf1 "dashboard,tcp,,7777,,7777"
%VBOX_PATH% modifyvm "TensorAgentOS" --natpf1 "ssh,tcp,,2222,,22"

echo.
echo ==============================================================================
echo [+] TensorAgentOS VM successfully created and configured in VirtualBox!
echo [*] Starting VM now...
echo ==============================================================================
%VBOX_PATH% startvm "TensorAgentOS"

pause
