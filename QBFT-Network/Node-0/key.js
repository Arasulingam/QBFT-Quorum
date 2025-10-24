const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3();

// --- Device 1 ---
const keystore1 = fs.readFileSync('/home/arasu/QBFT-Network/QBFT-Network/Node-0/data/keystore/UTC--2025-10-24T05-01-01.145116765Z--5c303cef53e62c9ea820bacfc67066362c1daed7', 'utf8');
const account1 = web3.eth.accounts.decrypt(JSON.parse(keystore1), 'device1password');
console.log("Device 1 Private Key:", account1.privateKey);

// --- Device 2 ---
const keystore2 = fs.readFileSync('/home/arasu/QBFT-Network/QBFT-Network/Node-0/data/keystore/UTC--2025-10-24T05-01-10.929691845Z--7bf551cb7535476bdc87b005aa2bdc7a2888b2b4', 'utf8');
const account2 = web3.eth.accounts.decrypt(JSON.parse(keystore2), 'device2password');
console.log("Device 2 Private Key:", account2.privateKey);
