const Web3 = require("web3");
const Tx = require('ethereumjs-tx');

const {provider_url, owner_key, owner, tokenAddress, claimAddress, gasPrice, gasLimit} = require('./common');

const TOTAL_PHA = 27000000;

const tokenAbi = [
  // approve
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "address",
        "name": "_spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function approve() {
  
  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(provider_url));

  let contract = new web3.eth.Contract(tokenAbi, tokenAddress);

  let nonce = await web3.eth.getTransactionCount(owner);
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: owner,
    to: tokenAddress,
    data: contract.methods.approve(claimAddress, web3.utils.toWei(TOTAL_PHA.toString())).encodeABI(), 
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
  }

  let privKey = new Buffer(owner_key, 'hex');
  let tx = new Tx(raw);
  tx.sign(privKey);
  let serializedTx = tx.serialize();

  let result = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(result);
}

approve();
