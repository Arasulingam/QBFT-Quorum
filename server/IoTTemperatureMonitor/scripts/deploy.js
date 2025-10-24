const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const IoTTemperatureMonitor = await ethers.getContractFactory("IoTTemperatureMonitor");
  const instance = await IoTTemperatureMonitor.deploy({ gasLimit: 6000000 });

  await instance.deployed();
  console.log("IoTTemperatureMonitor deployed at:", instance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
