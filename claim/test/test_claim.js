const Web3 = require("web3");
const Tx = require('ethereumjs-tx');

const private_key = "585e3170705ebf3d9d6002d292bb3e6e2cbab79aafd92892334c06640c98a531";
const owner = "0x67a669349a1Fc3062b18A35d8A5ed6DdB08C4431";

const eth1_key = "671d51640c3d4da2a7e6857455b5503b4b728b9965a072ff3ed1ed1dfb93ba3d";
const eth1 = "0x9B0d93e357A090D887Beb6bc0041b727BDC7734C";

const eth2_key = "1ba9bd899664ef36eb7ee73295dc7ec3943453cb03303163d7bdb36732e424cb";
const eth2 = "0x53B45E15752a28B70aBb9Bb65cF5F0076fC628eE";

const tokenAddress = "0x6c1E38226eFD562cBabA09d59976866fA21263ab";
const claimAddress = "0x611859d2C12A35480A372d2e290877cf51718c82";

const ksmAddress1 = "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"; //5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
const ksmAddress2 = "0xdc5c0eea8f8602deb7e1844b87b7635d5e5dfd5737ab5ddbcf62db78a8f7a01d"; //5Ea32SkcVaEmBVFNeMycjuAQKNzHzwosFrhEhwUFmawsEtkt

const abi = [
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ksm",
        "type": "uint256"
      }
    ],
    "name": "status",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "ksm",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "amount",
        "type": "uint256[]"
      }
    ],
    "name": "setUnclaimedToken",
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
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ksm",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "eth",
        "type": "address"
      }
    ],
    "name": "bindEthereumAddress",
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
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ksm",
        "type": "uint256"
      }
    ],
    "name": "unbind",
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
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ksm",
        "type": "uint256"
      }
    ],
    "name": "claim",
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

async function test() {
  
  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider("http://127.0.0.1:7545"));

  let contract = new web3.eth.Contract(abi, claimAddress);

  //owner call
  await test_setUnclaimedToken(web3, contract);
  
  await test_bindEthereumAddress(web3, contract, ksmAddress1, eth1);
  await test_bindEthereumAddress(web3, contract, ksmAddress2, eth2);
  
  await test_unbind(web3, contract, ksmAddress1);

  //user call
  await test_claim(web3, contract, ksmAddress2, eth2, eth2_key);
}

async function test_setUnclaimedToken(web3, contract) {
  let nonce = await web3.eth.getTransactionCount(owner);
  let gasPrice = 9e9;//web3.eth.gasPrice;
  let gasLimit = 5500000;
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: owner,
    to: claimAddress,
    data: contract.methods.setUnclaimedToken([ksmAddress1, ksmAddress2], [web3.utils.toWei("12"), web3.utils.toWei("23")]).encodeABI(), 
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

async function test_bindEthereumAddress(web3, contract, ksm, eth) {
  let nonce = await web3.eth.getTransactionCount(owner);
  let gasPrice = 9e9;//web3.eth.gasPrice;
  let gasLimit = 5500000;
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: owner,
    to: claimAddress,
    data: contract.methods.bindEthereumAddress(ksm, eth).encodeABI(), 
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

async function test_unbind(web3, contract, ksm) {
  let nonce = await web3.eth.getTransactionCount(owner);
  let gasPrice = 9e9;//web3.eth.gasPrice;
  let gasLimit = 5500000;
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: owner,
    to: claimAddress,
    data: contract.methods.unbind(ksm).encodeABI(), 
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
  }

  let privKey = new Buffer(private_key, 'hex');
  let tx = new Tx(raw);
  tx.sign(privKey);
  let serializedTx = tx.serialize();

  let result = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(result);

  let status = await contract.methods.status(ksm).call();
  console.log(status);
}

async function test_claim(web3, contract, ksm, _to, key) {
  let nonce = await web3.eth.getTransactionCount(_to);
  let gasPrice = 9e10;//web3.eth.gasPrice;
  let gasLimit = 5500000;
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: _to,
    to: claimAddress,
    data: contract.methods.claim(ksm).encodeABI(), 
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(gasLimit),
  }
  
  let privKey = new Buffer(key, 'hex');
  let tx = new Tx(raw);
  tx.sign(privKey);
  let serializedTx = tx.serialize();

  let result = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
  console.log(result);

  let status = await contract.methods.status(ksm).call();
  console.log(status);
}

test();
