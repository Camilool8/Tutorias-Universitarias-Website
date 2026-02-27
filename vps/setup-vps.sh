#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# VPS Initial Setup & SSH Hardening Script
# Usage: ./setup-vps.sh <root-password>
# Connects once as root@tutoriasuniversitarias.com, hardens
# SSH, creates user cjoga with sudo + SSH key, then locks
# root access permanently.
# ─────────────────────────────────────────────────────────────

if [ $# -ne 1 ]; then
  echo "Usage: $0 <root-password>"
  exit 1
fi

ROOT_PASS="$1"
HOST="tutoriasuniversitarias.com"
USER="cjoga"

SSH_PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINqitl5UGXaASZ4m7AoJx2AQ1d/ERuKNHRw44kYvm+aI cjoga@MacBook-Pro.local"

echo ">>> Connecting to root@${HOST} and running setup..."

sshpass -p "${ROOT_PASS}" ssh -o StrictHostKeyChecking=accept-new "root@${HOST}" bash -s <<REMOTE_SCRIPT

set -euo pipefail

echo "=== [1/6] Updating system packages ==="
apt-get update -qq && apt-get upgrade -y -qq

echo "=== [2/6] Installing essentials ==="
apt-get install -y -qq ufw fail2ban sudo

echo "=== [3/6] Creating user ${USER} with sudo ==="
if ! id "${USER}" &>/dev/null; then
  adduser --disabled-password --gecos "" "${USER}"
fi
usermod -aG sudo "${USER}"
# Allow sudo without password for initial Docker setup etc.
echo "${USER} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${USER}
chmod 440 /etc/sudoers.d/${USER}

echo "=== [4/6] Setting up SSH key for ${USER} ==="
mkdir -p /home/${USER}/.ssh
echo "${SSH_PUBKEY}" > /home/${USER}/.ssh/authorized_keys
chmod 700 /home/${USER}/.ssh
chmod 600 /home/${USER}/.ssh/authorized_keys
chown -R ${USER}:${USER} /home/${USER}/.ssh

echo "=== [5/6] Hardening SSH ==="
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/'               /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/'   /etc/ssh/sshd_config
sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/'      /etc/ssh/sshd_config
sed -i 's/^#\?ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?UsePAM.*/UsePAM no/'                                  /etc/ssh/sshd_config
sed -i 's/^#\?X11Forwarding.*/X11Forwarding no/'                    /etc/ssh/sshd_config
sed -i 's/^#\?MaxAuthTries.*/MaxAuthTries 3/'                       /etc/ssh/sshd_config

# Ensure no conflicting overrides in sshd_config.d
if [ -d /etc/ssh/sshd_config.d ]; then
  rm -f /etc/ssh/sshd_config.d/*.conf
fi

echo "=== [6/6] Configuring firewall ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Enable and start fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# Restart SSH to apply changes
systemctl restart sshd

echo ""
echo "============================================"
echo "  Setup complete!"
echo "  User: ${USER}"
echo "  SSH key: installed"
echo "  Root login: disabled"
echo "  Password auth: disabled"
echo "  Firewall: enabled (22, 80, 443)"
echo "  fail2ban: active"
echo "============================================"

REMOTE_SCRIPT

echo ""
echo ">>> Done! You can now connect with:"
echo "    ssh ${USER}@${HOST}"
