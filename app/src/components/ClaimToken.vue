<template>
  <div class="hello">
    <h1>Claim PHA token</h1>
    <br>
    <br>
    <h2>Your Ethereum account: <span class="eth">{{ eth_account }}</span></h2>
    <h2>You have {{ balance }} PHA, </h2>
    <h2>Select your Kusama account:</h2>
    <div>
      <multiselect class="mselect" v-model="selected_ksm_account" :options="ksm_accounts" placeholder="Select an account" :searchable="false"></multiselect>
    </div>
    <div v-if = "claimed">
      <h2> You have claimed your PHA </h2>
    </div>
    <div v-else-if = "unclaimedToken > 0">
      <h2>You have {{ unclaimedToken }} PHA to claim</h2>
    </div>
    <br>
    <div>
      <button v-on:click="claim" :disabled="unclaimedToken <= 0" :class="{'d-button': unclaimedToken <= 0}">Claim Now</button>
    </div>
    <div class="output" v-if="tx_hash !== ''">
      <h2>You've submit claiming request, the transaction hash is : {{ tx_hash }}</h2>
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import { decodeAddress } from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'
import Multiselect from 'vue-multiselect'

export default {
  components: {
    Multiselect
  },

  name: 'ClaimToken',
  data () {
    return {
      web3Installed: false,
      api_host: 'http://localhost:8080/',
      tokenAddress: '0xE24051d24Ba58369Dee4Ca7ECE8A66fD4A7cBb56',
      claimAddress: '0x54BF4831E770fC75582266b4790424f2bBE8A4c7',
      eth_account: '',
      ksm_accounts: [],
      balance: 0,
      unclaimedToken: 0,
      selected_ksm_account: '',
      claimed: false,
      tx_hash: ''
    }
  },

  watch: {
    'selected_ksm_account': function (val) {
      this.tx_hash = ''
      if (val && val.length === 47) {
        this.selected_ksm_account = val
        this.get_unclaimedtoken()
      } else {
        this.selected_ksm_account = ''
        this.unclaimedToken = 0
        this.claimed = false
      }
    }
  },

  methods: {
    address2Hex: function (address) {
      return u8aToHex(decodeAddress(address))
    },

    get_ksm_accounts: function () {
      this.$http.get(`${this.api_host}ksm_address?account=${this.eth_account}`).then((res) => {
        if (res.data.status === 'ok') {
          this.ksm_accounts = []
          for (let i in res.data.result) {
            if (res.data.result[i].status === 1) {
              this.ksm_accounts.push(res.data.result[i].sub_address)
            }
          }
        }
      })
    },

    get_unclaimedtoken: function () {
      const abi = [
        {
          'inputs': [
            {
              'internalType': 'uint256',
              'name': 'ksm',
              'type': 'uint256'
            }
          ],
          'name': 'status',
          'outputs': [
            {
              'internalType': 'address',
              'name': 'eth',
              'type': 'address'
            },
            {
              'internalType': 'bool',
              'name': 'claimed',
              'type': 'bool'
            },
            {
              'internalType': 'uint256',
              'name': 'balance',
              'type': 'uint256'
            }
          ],
          'stateMutability': 'view',
          'type': 'function',
          'constant': true
        }
      ]

      const contract = new window.web3.eth.Contract(abi, this.claimAddress)

      contract.methods.status(this.address2Hex(this.selected_ksm_account)).call().then(result => {
        // console.log('unclaimedTokenOf ' + this.eth_account + '(' + this.selected_ksm_account + '):' + JSON.stringify(result))
        this.unclaimedToken = Math.floor(result.balance / 1e18)
        this.claimed = result.claimed
      }).catch(error => {
        console.log(error)
      })
    },

    get_token_balance: function () {
      const abi = [
        {
          'constant': true,
          'inputs': [
            {
              'internalType': 'address',
              'name': '_owner',
              'type': 'address'
            }
          ],
          'name': 'balanceOf',
          'outputs': [
            {
              'internalType': 'uint256',
              'name': 'balance',
              'type': 'uint256'
            }
          ],
          'payable': false,
          'stateMutability': 'view',
          'type': 'function'
        }
      ]

      const contract = new window.web3.eth.Contract(abi, this.tokenAddress)

      contract.methods.balanceOf(this.eth_account).call().then(result => {
        this.balance = result / 1e18
      }).catch(error => {
        console.log(error)
      })
    },

    claim: function () {
      const abi = [
        {
          'inputs': [
            {
              'internalType': 'uint256',
              'name': 'ksm',
              'type': 'uint256'
            }
          ],
          'name': 'claim',
          'outputs': [
            {
              'internalType': 'bool',
              'name': 'success',
              'type': 'bool'
            }
          ],
          'stateMutability': 'nonpayable',
          'type': 'function'
        }
      ]

      const contract = new window.web3.eth.Contract(abi, this.claimAddress)
      contract.methods.claim(this.address2Hex(this.selected_ksm_account)).send({
        from: this.eth_account
      }).then(result => {
        // console.log('claim result:', result.transactionHash)

        this.unclaimedToken = 0
        this.claimed = true
        this.tx_hash = result.transactionHash
      }).catch(error => {
        console.log(error)
      })
    }
  },

  mounted () {
    let that = this

    const ethEnabled = () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        window.ethereum.enable()
        return true
      }
      return false
    }

    this.web3Installed = ethEnabled()
    if (!this.web3Installed) {
      alert('please install MetaMask to use this app')
      return
    }

    window.ethereum.on('accountsChanged', function (accounts) {
      if (accounts.length > 0) {
        that.eth_account = accounts[0]
        that.selected_ksm_account = ''
        that.unclaimedToken = 0
        that.claimed = false
        that.get_ksm_accounts()
        that.get_token_balance()
      }
    })

    window.web3.eth.getAccounts().then(accounts => {
      if (accounts.length > 0) {
        that.eth_account = accounts[0]
        that.get_ksm_accounts()
        that.get_token_balance()
      }
    })
  }
}
</script>

<style scoped>
/* @import 'vue-multiselect/dist/vue-multiselect.min.css'; */

h1, h2 {
  font-weight: normal;
}
</style>
<style lang="scss">
button {
  width: 120px;
  height: 50px;
  background: green;
  color: white;
  font-size: 20px;
}

.d-button {
  width: 120px;
  height: 50px;
  background: rgb(1, 61, 1);
  color: rgb(141, 138, 138);
  font-size: 20px;
}

.multiselect__tags {
  min-height: 20px;
  display: block;
  padding: 3px 40px 0 8px;
  border-radius: 5px;
  border: 0;
  background: #050308;
  font-size: 20px;
  color: rgb(250, 119, 12);
}

.multiselect__tags input {
  background: #050308;
  color: green;
  border: 1px solid green;
}

.output {
  color: rgb(232, 6, 240);
}

.eth {
  color: rgb(250, 119, 12);
}
</style>
