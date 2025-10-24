const IoTTemperatureMonitor = artifacts.require("IoTTemperatureMonitor");

module.exports = function (deployer) {
  deployer.deploy(IoTTemperatureMonitor);
};
