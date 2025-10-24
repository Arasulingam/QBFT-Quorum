var abi = ABI_PLACEHOLDER;
var bytecode = "0xBYTECODE_PLACEHOLDER";

var contract = eth.contract(abi);
var deployTx = contract.new({
    from: eth.accounts[0],
    data: bytecode,
    gas: 10000000
}, function(e, contract){
    if(!e) {
        if(!contract.address) {
            console.log("Transaction hash: " + contract.transactionHash);
        } else {
            console.log("CONTRACT ADDRESS: " + contract.address);
        }
    } else {
        console.log("Error: " + e);
    }
});
