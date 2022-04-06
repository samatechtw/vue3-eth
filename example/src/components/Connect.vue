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
      <div></div>
      <button @click="disconnect">Disconnect</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useChain } from '@samatech/vue3-eth'

const {
  walletConnected,
  loadingAccount,
  wrongNetwork,
  connectError,
  connectWallet,
  disconnectWallet,
} = useChain()

const connect = () => {
  console.log('OK')
  connectWallet('metamask')
}

const disconnect = () => {
  disconnectWallet()
}
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
