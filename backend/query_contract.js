const Web3 = require("web3");

const { decodeAddress } = require("@polkadot/util-crypto");
const { u8aToHex } = require('@polkadot/util');
const query = require("./query_db");

const {provider_url, claimAddress, abi} = require('./common');

function address2Hex(address) {
  return u8aToHex(decodeAddress(address));
}

async function query_status(ksm_account) {
  const web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(provider_url));

  const contract = new web3.eth.Contract(abi, claimAddress);

  if (ksm_account != undefined) {
    let status = await contract.methods.status(address2Hex(ksm_account)).call();
    console.log(status);

    return;
  }

  let sql = "select sub_address from stakedrop.eth_address where status = 1";
  let result = query.execute(sql);
  for (let i in result) {
    let ksm_account = result[i].sub_address;
    console.log('kusama account:', ksm_account);
    let status = await contract.methods.status(address2Hex(ksm_account)).call();
    console.log(status);
  }
}

async function main() {
  let args = process.argv.slice(2)

  if (args.length >= 1 && args[0] == "all" || args.length == 0) {
    await query_status();
    return;
  }

  if (args[0].length == 47)
    await query_status(args[0]);
  else 
    console.log('Bad Kusama account');
}

main().catch(console.error).finally(() => process.exit());

