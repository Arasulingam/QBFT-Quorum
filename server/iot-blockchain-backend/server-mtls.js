// Backend Server with mTLS for IoT Blockchain
const express = require('express');
const https = require('https');
const fs = require('fs');
const Web3 = require('web3');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3443; // Use 3443 for HTTPS

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Web3 Configuration
const web3 = new Web3(process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:22000');

// Smart Contract Configuration
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"deviceAddress","type":"address"},{"indexed":false,"internalType":"string","name":"deviceId","type":"string"},{"indexed":false,"internalType":"int256","name":"temperature","type":"int256"},{"indexed":false,"internalType":"string","name":"alertType","type":"string"}],"name":"AlertTriggered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"deviceAddress","type":"address"},{"indexed":false,"internalType":"string","name":"deviceId","type":"string"},{"indexed":false,"internalType":"string","name":"location","type":"string"}],"name":"DeviceRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"deviceAddress","type":"address"},{"indexed":false,"internalType":"string","name":"deviceId","type":"string"},{"indexed":false,"internalType":"int256","name":"temperature","type":"int256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TemperatureRecorded","type":"event"},{"inputs":[{"internalType":"address","name":"deviceAddress","type":"address"}],"name":"authorizeDevice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"deviceAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"deviceReadings","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"int256","name":"temperature","type":"int256"},{"internalType":"string","name":"deviceId","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"bool","name":"isValid","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"devices","outputs":[{"internalType":"string","name":"deviceId","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"bool","name":"isAuthorized","type":"bool"},{"internalType":"uint256","name":"registeredAt","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllDevices","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"deviceAddress","type":"address"}],"name":"getDeviceInfo","outputs":[{"internalType":"string","name":"deviceId","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"bool","name":"isAuthorized","type":"bool"},{"internalType":"uint256","name":"registeredAt","type":"uint256"},{"internalType":"uint256","name":"lastUpdate","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"deviceAddress","type":"address"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"getDeviceReadings","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"int256","name":"temperature","type":"int256"},{"internalType":"string","name":"deviceId","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct IoTTemperatureMonitor.TemperatureReading[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"deviceAddress","type":"address"}],"name":"getLatestReading","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"int256","name":"temperature","type":"int256"},{"internalType":"string","name":"deviceId","type":"string"},{"internalType":"string","name":"location","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"deviceAddress","type":"address"}],"name":"getReadingCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"highTempThreshold","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lowTempThreshold","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"int256","name":"temperature","type":"int256"}],"name":"recordTemperature","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"deviceAddress","type":"address"},{"internalType":"string","name":"deviceId","type":"string"},{"internalType":"string","name":"location","type":"string"}],"name":"registerDevice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"deviceAddress","type":"address"}],"name":"revokeDevice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"int256","name":"high","type":"int256"},{"internalType":"int256","name":"low","type":"int256"}],"name":"updateThresholds","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const contract = new web3.eth.Contract(contractABI, contractAddress);

// TLS Configuration
const tlsOptions = {
  // Server certificate and key
  key: fs.readFileSync('/home/arasu/QBFT-Network/certs/server/server-key.pem'),
  cert: fs.readFileSync('/home/arasu/QBFT-Network/certs/server/server-cert.pem'),
  
  // CA certificate for client verification
  ca: fs.readFileSync('/home/arasu/QBFT-Network/certs/ca/ca-cert.pem'),
  
  // Request client certificate
  requestCert: true,
  
  // Reject unauthorized clients (enforce mTLS)
  rejectUnauthorized: true,
  
  // TLS version
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
};

// Middleware to log client certificate info
app.use((req, res, next) => {
  if (req.client.authorized) {
    const cert = req.socket.getPeerCertificate();
    console.log('✅ Authenticated client:', cert.subject.CN);
    req.clientCN = cert.subject.CN; // Store client CN for authorization
  } else {
    console.log('❌ Unauthorized client connection attempt');
  }
  next();
});

// Middleware to verify device identity
const verifyDevice = (req, res, next) => {
  if (!req.client.authorized) {
    return res.status(401).json({ 
      error: 'Client certificate required',
      message: 'mTLS authentication failed'
    });
  }
  
  const clientCN = req.socket.getPeerCertificate().subject.CN;
  const allowedDevices = ['ESP32-TEMP-001', 'ESP32-TEMP-002'];
  
  if (!allowedDevices.includes(clientCN)) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Device not authorized'
    });
  }
  
  next();
};

// Health check (no authentication required for monitoring)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IoT Blockchain Server with mTLS is running',
    tls: 'enabled'
  });
});

// Register device (owner only - add separate auth if needed)
app.post('/api/register-device', async (req, res) => {
  try {
    const { deviceAddress, deviceId, location } = req.body;

    if (!deviceAddress || !deviceId || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const account = web3.eth.accounts.privateKeyToAccount(process.env.OWNER_PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);

    const tx = contract.methods.registerDevice(deviceAddress, deviceId, location);
    const gas = await tx.estimateGas({ from: process.env.OWNER_ADDRESS });
    const gasPrice = await web3.eth.getGasPrice();

    const receipt = await tx.send({
      from: process.env.OWNER_ADDRESS,
      gas: gas,
      gasPrice: gasPrice
    });

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      deviceAddress,
      deviceId,
      location
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record temperature - REQUIRES DEVICE CERTIFICATE
app.post('/api/temperature', verifyDevice, async (req, res) => {
  try {
    const { deviceId, temperature, privateKey } = req.body;
    const clientCN = req.socket.getPeerCertificate().subject.CN;

    // Verify device ID matches certificate CN
    if (deviceId !== clientCN) {
      return res.status(403).json({ 
        error: 'Device ID mismatch',
        message: `Certificate CN (${clientCN}) does not match deviceId (${deviceId})`
      });
    }

    if (!deviceId || temperature === undefined || !privateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tempInt = Math.round(temperature * 100);

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    const tx = contract.methods.recordTemperature(tempInt);
    const gas = await tx.estimateGas({ from: account.address });
    const gasPrice = await web3.eth.getGasPrice();

    const receipt = await tx.send({
      from: account.address,
      gas: gas,
      gasPrice: gasPrice
    });

    console.log(`📊 Temperature recorded: ${temperature}°C from ${clientCN}`);

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      deviceId,
      temperature,
      timestamp: new Date().toISOString(),
      authenticatedBy: 'mTLS'
    });
  } catch (error) {
    console.error('Error recording temperature:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get latest temperature - REQUIRES DEVICE CERTIFICATE
app.get('/api/temperature/:deviceAddress', verifyDevice, async (req, res) => {
  try {
    const { deviceAddress } = req.params;
    const clientCN = req.socket.getPeerCertificate().subject.CN;

    const reading = await contract.methods.getLatestReading(deviceAddress).call();

    res.json({
      success: true,
      data: {
        timestamp: new Date(parseInt(reading.timestamp) * 1000).toISOString(),
        temperature: parseFloat(reading.temperature) / 100,
        deviceId: reading.deviceId,
        location: reading.location
      },
      requestedBy: clientCN
    });
  } catch (error) {
    console.error('Error getting temperature:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get device readings history
app.get('/api/readings/:deviceAddress', verifyDevice, async (req, res) => {
  try {
    const { deviceAddress } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const readings = await contract.methods.getDeviceReadings(deviceAddress, limit).call();

    const formattedReadings = readings.map(reading => ({
      timestamp: new Date(parseInt(reading.timestamp) * 1000).toISOString(),
      temperature: parseFloat(reading.temperature) / 100,
      deviceId: reading.deviceId,
      location: reading.location,
      isValid: reading.isValid
    }));

    res.json({
      success: true,
      count: formattedReadings.length,
      data: formattedReadings
    });
  } catch (error) {
    console.error('Error getting readings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all devices
app.get('/api/devices', verifyDevice, async (req, res) => {
  try {
    const devices = await contract.methods.getAllDevices().call();

    const deviceList = await Promise.all(
      devices.map(async (address) => {
        try {
          const reading = await contract.methods.getLatestReading(address).call();
          return {
            address,
            deviceId: reading.deviceId,
            location: reading.location,
            lastTemperature: parseFloat(reading.temperature) / 100,
            lastUpdate: new Date(parseInt(reading.timestamp) * 1000).toISOString()
          };
        } catch (error) {
          return {
            address,
            deviceId: 'Unknown',
            location: 'Unknown',
            lastTemperature: null,
            lastUpdate: null
          };
        }
      })
    );

    res.json({
      success: true,
      count: deviceList.length,
      data: deviceList
    });
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create HTTPS server with mTLS
const server = https.createServer(tlsOptions, app);

server.listen(PORT,'0.0.0.0', () => {
  console.log('========================================');
  console.log('🔒 HTTPS Server with mTLS Started');
  console.log('========================================');
  console.log(`🚀 Server running on port https://0.0.0.0:${PORT}`);
  console.log(`📡 Connected to blockchain: ${process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:22000'}`);
  console.log(`📝 Contract address: ${contractAddress}`);
  console.log(`🔐 TLS: Mutual TLS (mTLS) enabled`);
  console.log(`🛡️  Client certificates: REQUIRED`);
  console.log('========================================');
});

// Listen for blockchain events
contract.events.TemperatureRecorded({
  fromBlock: 'latest'
})
.on('data', (event) => {
  console.log('📊 Temperature Recorded:', {
    deviceAddress: event.returnValues.deviceAddress,
    deviceId: event.returnValues.deviceId,
    temperature: parseFloat(event.returnValues.temperature) / 100,
    timestamp: new Date(parseInt(event.returnValues.timestamp) * 1000).toISOString()
  });
})
.on('error', console.error);

contract.events.AlertTriggered({
  fromBlock: 'latest'
})
.on('data', (event) => {
  console.log('⚠️  ALERT TRIGGERED:', {
    deviceAddress: event.returnValues.deviceAddress,
    deviceId: event.returnValues.deviceId,
    temperature: parseFloat(event.returnValues.temperature) / 100,
    alertType: event.returnValues.alertType
  });
})
.on('error', console.error);

module.exports = server;
