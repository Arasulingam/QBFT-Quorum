require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.0",
  networks: {
    qbft: {
      url: "http://127.0.0.1:22000", // Your QBFT RPC
      chainId: 1337,
      accounts: [
        // Private key of deployer account
        "0x0e3ac35c789ce824ef1870c42eabe8d628c9a0f0"
      ]
    }
  }
};
