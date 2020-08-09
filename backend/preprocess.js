const Web3 = require("web3");
const Tx = require("ethereumjs-tx");

const { decodeAddress } = require("@polkadot/util-crypto");
const { u8aToHex } = require('@polkadot/util');
const query = require("./query_db");

const {provider_url, owner_key, owner, claimAddress, abi, gasLimit, gasPrice, LAST_BLOCK_KEY} = require('./common');
const {update_last_block, get_nominators, get_max_block} = require('./common');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider_url));

const contract = new web3.eth.Contract(abi, claimAddress);

function address2Hex(address) {
  return u8aToHex(decodeAddress(address));
}

async function setUnclaimedToken(ksmAddress, amount) {
  let nonce = await web3.eth.getTransactionCount(owner);
  let raw = {
    nonce: nonce,
    value: '0x0', 
    from: owner,
    to: claimAddress,
    data: contract.methods.setUnclaimedToken(ksmAddress, amount).encodeABI(), 
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

async function bindEthereumAddress(ksm, eth) {
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
  //console.log(result);
}

async function setToken() {
  const size = 200;

  const sql = "select nominator, pha from stakedrop.stat_pha where pha > 0";
  const result = query.execute(sql);
  console.log(`total ${result.length} kusama accouts`);

  let total = 0;
  while (total < result.length) {
    let key_array = [];
    let pha_array = [];

    for (let i = 0; i < size; i++) {
      if (i + total >= result.length) break;
      const nominator = result[i + total].nominator;
      const pub_key = address2Hex(nominator);
      const pha = result[i + total].pha;
      //console.log(`${nominator}:${pub_key}:${pha}`);
      const pha_wei = web3.utils.toWei(pha.toString());

      key_array.push(pub_key);
      pha_array.push(pha_wei);
    }

    if (key_array.length > 0) {
      await setUnclaimedToken(key_array, pha_array); 
    }

    total += size;
  }
}

async function bindAddress() {
  let nominators = get_nominators();
  
  let max_block = get_max_block();
  sql = "select * from stakedrop.eth_address where status = 0 and block_number <= " + max_block;
  result = query.execute(sql);

  for (let i in result) {
    let sub_address = result[i].sub_address;
    if (nominators.indexOf(sub_address) == -1) {
      console.log(`${sub_address} not in stakedrop`);
      continue;
    }

    let ksm_address = address2Hex(sub_address);
    let eth_address = result[i].eth_address;
    //console.log(`${sub_address}:${ksm_address}:${eth_address}`);
    
    await bindEthereumAddress(ksm_address, eth_address);

    query.execute("update stakedrop.eth_address set status = 1 where sub_address='" + sub_address + "'");
  }

  update_last_block(max_block);
}

async function main() {
  let args = process.argv.slice(2)
  if (args.length == 0) {
    await setToken();
    await bindAddress();
  }

  if (args.length == 1 && args[0] == "init") {
    query.execute("DELETE from stakedrop.dict where _key = '" + LAST_BLOCK_KEY +"'");
    query.execute("update stakedrop.eth_address set status = 0");

    return;
  }

  if (args.length == 1 && args[0] == "set") {
    await setToken();
    return;
  }

  if (args.length >= 3 && args[0] == "set") {
    let ksm_address = args[1];
    let amount = args[2];
    await setUnclaimedToken([address2Hex(ksm_address)], [web3.utils.toWei(amount)]);
    return;
  }

  if (args.length == 1 && args[0] == "bind") {
    await bindAddress();
    return;
  }

  if (args.length >= 3 && args[0] == "bind") {
    let ksm_address = args[1];
    let eth_address = args[2];
    await bindEthereumAddress(address2Hex(ksm_address), eth_address);
    return;
  }
}

main().catch(console.error).finally(() => process.exit());