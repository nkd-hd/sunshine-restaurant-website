#!/bin/bash

# Setup VPS Admin User for Software Architecture Course Submission
# This script creates the required admin user with specified credentials

echo "🚀 Setting up VPS Admin User for Course Submission"
echo "=================================================="

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   echo "✅ Running with root privileges"
else
   echo "❌ This script needs to be run with sudo privileges"
   echo "Please run: sudo ./setup-vps-admin.sh"
   exit 1
fi

# Create admin user
echo "📝 Creating admin user..."
useradd -m -s /bin/bash admin

# Set password for admin user
echo "🔑 Setting password for admin user..."
echo "admin:Admin" | chpasswd

# Add admin user to sudo group
echo "👑 Adding admin user to sudo group..."
usermod -aG sudo admin

# Create .ssh directory for admin user
echo "🔐 Setting up SSH access for admin user..."
mkdir -p /home/admin/.ssh
chmod 700 /home/admin/.ssh
chown admin:admin /home/admin/.ssh

# Copy authorized keys if they exist
if [ -f /home/$SUDO_USER/.ssh/authorized_keys ]; then
    cp /home/$SUDO_USER/.ssh/authorized_keys /home/admin/.ssh/
    chown admin:admin /home/admin/.ssh/authorized_keys
    chmod 600 /home/admin/.ssh/authorized_keys
    echo "✅ SSH keys copied for admin user"
fi

# Enable password authentication (for course submission requirements)
echo "🔧 Configuring SSH for password authentication..."
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Restart SSH service
systemctl restart ssh

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    apt-get update
    apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
    usermod -aG docker admin
    echo "✅ Docker installed and admin user added to docker group"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
fi

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/event-booking-system
chown admin:admin /opt/event-booking-system

# Display summary
echo ""
echo "🎉 VPS Admin User Setup Complete!"
echo "================================="
echo "👤 Username: admin"
echo "🔑 Password: Admin"
echo "🏠 Home Directory: /home/admin"
echo "👑 Sudo Access: Yes"
echo "🐳 Docker Access: Yes"
echo "🔐 SSH Access: Yes (password authentication enabled)"
echo ""
echo "📋 For Course Submission:"
echo "VPS IP: $(curl -s ifconfig.me)"
echo "Username: admin"
echo "Password: Admin"
echo ""
echo "🔗 Test SSH connection:"
echo "ssh admin@$(curl -s ifconfig.me)"
echo ""
echo "✅ Ready for Software Architecture Course submission!"
