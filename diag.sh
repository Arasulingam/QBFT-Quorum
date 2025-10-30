#!/bin/bash

echo "=========================================="
echo "mTLS Server Diagnostic Information"
echo "=========================================="
echo ""

echo "1. Server Process Status:"
ps aux | grep "node.*server" | grep -v grep || echo "   ❌ Server not running"
echo ""

echo "2. Port 3443 Status:"
netstat -tuln | grep 3443 || echo "   ❌ Port 3443 not listening"
echo ""

echo "3. Server IP Addresses:"
hostname -I
echo ""

echo "4. Network Interfaces:"
ip addr show | grep -E "^[0-9]:|inet " | grep -v "127.0.0.1"
echo ""

echo "5. Firewall Status:"
sudo ufw status 2>/dev/null || echo "   Firewall not active (ufw)"
echo ""

echo "6. WSL Network (if applicable):"
cat /proc/version | grep -i microsoft && {
    echo "   WSL detected!"
    echo "   WSL IP: $(ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)"
}
echo ""

echo "=========================================="
echo "Recommended ESP32 Configuration:"
echo "=========================================="
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "const char* serverUrl = \"https://$SERVER_IP:3443/api/temperature\";"
echo ""
