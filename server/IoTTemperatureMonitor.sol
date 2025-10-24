// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IoTTemperatureMonitor {
    
    struct TemperatureReading {
        uint256 timestamp;
        int256 temperature;  // Temperature in Celsius * 100 (e.g., 2550 = 25.50°C)
        string deviceId;
        string location;
        bool isValid;
    }
    
    struct Device {
        string deviceId;
        string location;
        bool isAuthorized;
        uint256 registeredAt;
        uint256 lastUpdate;
    }
    
    // Mapping from device address to Device info
    mapping(address => Device) public devices;
    
    // Mapping from device address to their temperature readings
    mapping(address => TemperatureReading[]) public deviceReadings;
    
    // Array of all device addresses for enumeration
    address[] public deviceAddresses;
    
    // Events
    event DeviceRegistered(address indexed deviceAddress, string deviceId, string location);
    event TemperatureRecorded(
        address indexed deviceAddress,
        string deviceId,
        int256 temperature,
        uint256 timestamp
    );
    event AlertTriggered(
        address indexed deviceAddress,
        string deviceId,
        int256 temperature,
        string alertType
    );
    
    // Owner of the contract
    address public owner;
    
    // Temperature thresholds for alerts (in Celsius * 100)
    int256 public highTempThreshold = 3500;  // 35.00°C
    int256 public lowTempThreshold = 1000;   // 10.00°C
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(devices[msg.sender].isAuthorized, "Device not authorized");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Register a new IoT device
    function registerDevice(
        address deviceAddress,
        string memory deviceId,
        string memory location
    ) public onlyOwner {
        require(!devices[deviceAddress].isAuthorized, "Device already registered");
        
        devices[deviceAddress] = Device({
            deviceId: deviceId,
            location: location,
            isAuthorized: true,
            registeredAt: block.timestamp,
            lastUpdate: 0
        });
        
        deviceAddresses.push(deviceAddress);
        
        emit DeviceRegistered(deviceAddress, deviceId, location);
    }
    
    // Record temperature reading
    function recordTemperature(int256 temperature) public onlyAuthorized {
        Device storage device = devices[msg.sender];
        
        TemperatureReading memory reading = TemperatureReading({
            timestamp: block.timestamp,
            temperature: temperature,
            deviceId: device.deviceId,
            location: device.location,
            isValid: true
        });
        
        deviceReadings[msg.sender].push(reading);
        device.lastUpdate = block.timestamp;
        
        emit TemperatureRecorded(
            msg.sender,
            device.deviceId,
            temperature,
            block.timestamp
        );
        
        // Check for temperature alerts
        if (temperature > highTempThreshold) {
            emit AlertTriggered(msg.sender, device.deviceId, temperature, "HIGH_TEMPERATURE");
        } else if (temperature < lowTempThreshold) {
            emit AlertTriggered(msg.sender, device.deviceId, temperature, "LOW_TEMPERATURE");
        }
    }
    
    // Get latest temperature reading for a device
    function getLatestReading(address deviceAddress) 
        public 
        view 
        returns (
            uint256 timestamp,
            int256 temperature,
            string memory deviceId,
            string memory location
        ) 
    {
        require(devices[deviceAddress].isAuthorized, "Device not found");
        TemperatureReading[] storage readings = deviceReadings[deviceAddress];
        require(readings.length > 0, "No readings available");
        
        TemperatureReading storage latest = readings[readings.length - 1];
        return (latest.timestamp, latest.temperature, latest.deviceId, latest.location);
    }
    
    // Get all readings for a device
    function getDeviceReadings(address deviceAddress, uint256 limit) 
        public 
        view 
        returns (TemperatureReading[] memory) 
    {
        TemperatureReading[] storage readings = deviceReadings[deviceAddress];
        uint256 length = readings.length;
        
        if (limit == 0 || limit > length) {
            limit = length;
        }
        
        TemperatureReading[] memory result = new TemperatureReading[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            result[i] = readings[length - limit + i];
        }
        
        return result;
    }
    
    // Get total number of readings for a device
    function getReadingCount(address deviceAddress) public view returns (uint256) {
        return deviceReadings[deviceAddress].length;
    }
    
    // Get all registered devices
    function getAllDevices() public view returns (address[] memory) {
        return deviceAddresses;
    }
    
    // Get device info
    function getDeviceInfo(address deviceAddress) 
        public 
        view 
        returns (
            string memory deviceId,
            string memory location,
            bool isAuthorized,
            uint256 registeredAt,
            uint256 lastUpdate
        ) 
    {
        Device storage device = devices[deviceAddress];
        return (
            device.deviceId,
            device.location,
            device.isAuthorized,
            device.registeredAt,
            device.lastUpdate
        );
    }
    
    // Update temperature thresholds
    function updateThresholds(int256 high, int256 low) public onlyOwner {
        require(high > low, "High threshold must be greater than low threshold");
        highTempThreshold = high;
        lowTempThreshold = low;
    }
    
    // Revoke device authorization
    function revokeDevice(address deviceAddress) public onlyOwner {
        devices[deviceAddress].isAuthorized = false;
    }
    
    // Re-authorize device
    function authorizeDevice(address deviceAddress) public onlyOwner {
        require(bytes(devices[deviceAddress].deviceId).length > 0, "Device not registered");
        devices[deviceAddress].isAuthorized = true;
    }
}
