<template>
  <div class="connect">
    <h1>Vue3 Eth</h1>
    <div v-if="!walletConnected" class="not-connected">
      <div>You are not connected</div>
      <div v-if="wrongNetwork">Wrong network...</div>
      <div v-if="connectError" class="error">Connect error: {{ connectError }}</div>
      <div v-if="loadingAccount" class="loading">Loading...</div>
      <button v-else @click="connect">Connect</button>
    </div>
    <div v-else>
      <div>You are connected!</div>
      <div v-for="wallet in wallets" :key="wallet">
        {{ addressDisplay(wallet) }}
      </div>
      <button @click="disconnect">Disconnect</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toEthDisplay, useChain } from '@samatech/vue3-eth'
import { onMounted, ref, watch } from 'vue'

const {
  walletConnected,
  wallets,
  loadingAccount,
  wrongNetwork,
  connectError,
  getBalance,
  connectWallet,
  reconnectWallet,
  disconnectWallet,
} = useChain()

const balances = ref<Record<string, string>>({})

const addressDisplay = (addr: string | undefined) => {
  if (addr) {
    const bal = toEthDisplay(balances.value[addr] ?? '')
    return `${addr.slice(0, 6)}...${addr.slice(addr.length - 4, addr.length)} -> ${bal}`
  }
  return ''
}

watch(walletConnected, async (connected) => {
  if (connected) {
    for (const account of wallets.value) {
      balances.value[account] = (await getBalance(account))?.toString() ?? ''
    }
  }
})

const connect = async () => {
  await connectWallet('metamask')
}

const disconnect = () => {
  disconnectWallet()
}

onMounted(() => {
  reconnectWallet('metamask')
})
</script>

<style lang="postcss" scoped>
.connect {
  padding: 120px 48px 0;
  max-width: 600px;
  margin: 0 auto;
}
button,
.loading {
  margin-top: 16px;
}
.error {
  margin-top: 8px;
  color: red;
}
</style>
