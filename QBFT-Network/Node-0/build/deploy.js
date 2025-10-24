const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Connect to your Quorum node
const web3 = new Web3('http://localhost:22000');

// Read contract files
const abiPath = path.join(__dirname, 'IoTTemperatureMonitor.abi');
const binPath = path.join(__dirname, 'IoTTemperatureMonitor.bin');

const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const contractBytecode = fs.readFileSync(binPath, 'utf8');

async function deployContract() {
    try {
        // Get the first account (unlocked by default in Quorum)
        const accounts = await web3.eth.getAccounts();
        const deployerAccount = accounts[2];
        
        console.log('Deploying from account:', deployerAccount);

        // Create contract instance
        const contract = new web3.eth.Contract(contractABI);

        // Check node sync status
        const blockNumber = await web3.eth.getBlockNumber();
        console.log('Current block number:', blockNumber);
        
        // Check account balance
        const balance = await web3.eth.getBalance(deployerAccount);
        console.log('Account balance:', balance);

        // Deploy the contract with higher gas limit
        const deployedContract = await contract.deploy({
            data: '0x' + contractBytecode
        }).send({
            from: deployerAccount,
            gas: 10000000, // Increased gas limit
            gasPrice: 0 // Quorum uses 0 gas price
        });

        // THIS IS YOUR CONTRACT ADDRESS!
        const contractAddress = deployedContract.options.address;
        
        console.log('\n✅ CONTRACT DEPLOYED SUCCESSFULLY!');
        console.log('📍 Contract Address:', contractAddress);
        
        // Save to file
        fs.writeFileSync('contract-address.txt', contractAddress);
        console.log('💾 Address saved to contract-address.txt\n');
        
        return contractAddress;

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
    }
}

// Run deployment
deployContract();
