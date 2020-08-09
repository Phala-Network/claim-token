const Web3 = require("web3");
const Tx = require("ethereumjs-tx");

const { decodeAddress } = require("@polkadot/util-crypto");
const { u8aToHex } = require('@polkadot/util');
const query = require("./query_db");

const {provider_url, owner_key, owner, claimAddress, abi, gasPrice, gasLimit} = require('./common');
const {update_last_block, get_nominators, get_max_block, LAST_BLOCK_KEY} = require('./common');

const timer = ms => new Promise( res => setTimeout(res, ms))

function address2Hex(address) {
  return u8aToHex(decodeAddress(address));
}

async function bindEthereumAddress(web3, contract, ksm, eth) {
  let nonce = await web3.eth.getTransactionCount(owner);
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: owner,
    to: claimAddress,
    data: contract.methods.bindEthereumAddress(ksm, eth).encodeABI(), 
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

async function bindAddress(nominators, web3, contract) {
  let max_block = get_max_block();
  let sql = "select * from stakedrop.eth_address where status = 0";
  let result = query.execute("select _value as last_block from stakedrop.dict where _key = '" + LAST_BLOCK_KEY +"'");
  if (result.length > 0) {
    let last_block = result[0].last_block;
    if (last_block >= max_block) {
      console.log("no data updated");

      return;
    }

    sql += " and block_number > " + last_block;
  }

  result = query.execute(sql);

  for (let i in result) {
    let sub_address = result[i].sub_address;
    if (nominators.indexOf(sub_address) == -1) {
      console.log(`${sub_address} not in stakedrop`);
      continue;
    }

    let ksm_address = address2Hex(sub_address);
    let eth_address = result[i].eth_address;
    
    console.log(`bind ${sub_address} to ${eth_address} ...`);
    
    await bindEthereumAddress(web3, contract, ksm_address, eth_address);

    query.execute("update stakedrop.eth_address set status = 1 where sub_address='" + sub_address + "'");
  }

  update_last_block(max_block);
}

async function main() {
  
  let nominators = get_nominators();
  
  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(provider_url));

  let contract = new web3.eth.Contract(abi, claimAddress);

  while (true) {

    await bindAddress(nominators, web3, contract);

    await timer(10 * 1000);
  }
   
}

main().catch(console.error).finally(() => process.exit());