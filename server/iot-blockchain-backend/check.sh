#!/bin/bash

echo "=== Checking System Status ==="
echo ""

echo "1. Backend Contract Address:"
grep CONTRACT_ADDRESS /home/arasu/QBFT-Network/server/iot-blockchain-backend/.env

echo ""
echo "2. Device List from API:"
curl -s http://localhost:3000/api/devices | python3 -m json.tool

echo ""
echo "3. Test Device 2 Recording:"
curl -s -X POST http://localhost:3000/api/temperature \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32-TEMP-002",
    "temperature": 24.0,
    "privateKey": "0x1ada126eca1b7650a33834e7da8135e27df076b726c1339bef5a6743655683be"
  }' | python3 -m json.tool
