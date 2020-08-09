const query = require("./query_db");
const LAST_BLOCK_KEY = "last_block";

//ganache
const owner_key = "585e3170705ebf3d9d6002d292bb3e6e2cbab79aafd92892334c06640c98a531";
const owner = "0x67a669349a1Fc3062b18A35d8A5ed6DdB08C4431";
const tokenAddress = "0xE24051d24Ba58369Dee4Ca7ECE8A66fD4A7cBb56";
const claimAddress = "0x54BF4831E770fC75582266b4790424f2bBE8A4c7";

const provider_url = "http://127.0.0.1:7545";

const gasPrice = 9e9;
const gasLimit = 5500000;

const abi = [
  {
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
        "name": "eth",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
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
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
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
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
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
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function update_last_block(max_block) {
  let sql = "select _value from stakedrop.dict where _key = '" + LAST_BLOCK_KEY + "'";
  let result = query.execute(sql);
  if (result.length == 0)
    sql = "insert into stakedrop.dict(_key, _value) values('" + LAST_BLOCK_KEY +"', '" + max_block.toString() +"')";
  else
    sql = "update stakedrop.dict set _value = " + max_block + " where _key = '" + LAST_BLOCK_KEY + "'";

  query.execute(sql);
}

function get_nominators() {
  let sql = "select nominator, pha from stakedrop.stat_pha where pha > 0";
  let result = query.execute(sql);

  let nominators = [];
  for (let i in result) {
    nominators.push(result[i].nominator);
  }

  return nominators;
}

function get_max_block() {
  let result = query.execute("select max(block_number) as max_block from stakedrop.eth_address");

  return result[0].max_block;
}

module.exports = {provider_url, owner_key, owner, tokenAddress, claimAddress, abi, gasLimit, gasPrice, update_last_block, get_nominators, get_max_block, LAST_BLOCK_KEY}
