module.exports = {
  networks: {
    qbft: {
      host: "127.0.0.1",
      port: 22000,
      network_id: "1337",
      gasPrice: 0,
      gas: 4500000
    }
  },
  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};
