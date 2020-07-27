const Web3 = require("web3");
const Tx = require('ethereumjs-tx');

const private_key = "585e3170705ebf3d9d6002d292bb3e6e2cbab79aafd92892334c06640c98a531";
const owner = "0x67a669349a1Fc3062b18A35d8A5ed6DdB08C4431";
const tokenAddress = "0x6c1E38226eFD562cBabA09d59976866fA21263ab";
const claimAddress = "0x611859d2C12A35480A372d2e290877cf51718c82";

const minABI = [
  // balanceOf
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  // decimals
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
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
  },
  // allowance
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "remaining",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

async function test() {
  
  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider("http://127.0.0.1:7545"));

  let contract = new web3.eth.Contract(minABI, tokenAddress);

  // approve
  let nonce = await web3.eth.getTransactionCount(owner);
  let gasPrice = 9e9;//web3.eth.gasPrice;
  let gasLimit = 5500000;
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: owner,
    to: tokenAddress,
    data: contract.methods.approve(claimAddress, web3.utils.toWei("12345")).encodeABI(), 
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
  }

  let privKey = new Buffer(private_key, 'hex');
  let tx = new Tx(raw);
  tx.sign(privKey);
  let serializedTx = tx.serialize();

  let result = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(result);
}

test();
