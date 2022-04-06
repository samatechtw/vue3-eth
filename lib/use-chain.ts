import { providers, Signer } from 'ethers/lib.esm'
import Big from 'big.js'
import { ref } from 'vue'
import { useMetamask } from './use-metamask'
import { useWalletconnect } from './use-walletconnect'
import { ChainState, IProviderConfig, Provider, Web3Provider } from './provider-config'

Big.PE = 1000

function chainInit(provider: Provider): Web3Provider {
  return new providers.Web3Provider(provider)
}

// TODO non-reactive due to issue with proxying ethers objects
const state: ChainState = {
  provider: undefined,
  signer: undefined,
  loaded: false,
}

const chainId = ref()
const loadingAccount = ref(false)
const walletConnected = ref(false)
const wrongNetwork = ref(false)
const walletSource = ref()
const connectError = ref()

const connectCallback = ref()
const disconnectCallback = ref()
const chainChangedCallback = ref()
const accountsChangedCallback = ref()
const setupProviderCallback = ref()

// Callback helpers
type ConnectCallback = (address: string, connected: boolean) => void
const onConnect = (callback: ConnectCallback) => {
  connectCallback.value = callback
}

type DisconnectCallback = () => void
const onDisconnect = (callback: DisconnectCallback) => {
  disconnectCallback.value = callback
}

type ChainChangedCallback = (chainId: number) => void
const onChainChanged = (callback: ChainChangedCallback) => {
  chainChangedCallback.value = callback
}

type AccountsChangedCallback = (accounts: unknown[]) => void
const onAccountsChanged = (callback: AccountsChangedCallback) => {
  accountsChangedCallback.value = callback
}

type SetupProviderCallback = (signer: Signer) => void
const onSetupProvider = (callback: SetupProviderCallback) => {
  setupProviderCallback.value = callback
}

export const useChain = (config?: IProviderConfig) => {
  const { ethChainId } = config ?? {}

  const verifyProvider = () => {
    if (!state.provider) {
      throw new Error('errors.not_connected')
    }
  }

  const setupWallet = async (walletName: string) => {
    connectError.value = null
    if (walletName === 'metamask') {
      walletSource.value = useMetamask(config)
    } else if (walletName === 'walletconnect') {
      walletSource.value = useWalletconnect(config)
    }
    return walletSource.value.getProvider()
  }

  const setupProvider = async (walletProvider: Provider) => {
    wrongNetwork.value = false
    state.provider = chainInit(walletProvider)
    state.signer = state.provider.getSigner()
    if (setupProviderCallback.value) {
      setupProviderCallback.value(state.signer)
    }
    await subscribeProvider(state.provider)

    const network = await state.provider.getNetwork()
    chainId.value = network.chainId
    if (ethChainId && chainId.value.toString() !== ethChainId) {
      wrongNetwork.value = true
      return false
    }
    return true
  }

  const reconnectWallet = async (walletName: string) => {
    loadingAccount.value = true
    try {
      const walletProvider = await setupWallet(walletName)
      if (await setupProvider(walletProvider)) {
        if (connectCallback.value) {
          const address = await state.signer?.getAddress()
          await connectCallback.value(address, true)
        }
        walletConnected.value = true
      }
    } catch (e) {
      console.log('Fail to reconnect', e)
      disconnect()
    } finally {
      loadingAccount.value = false
    }
  }

  const connectWallet = async (walletName: string) => {
    loadingAccount.value = true
    try {
      const walletProvider = await setupWallet(walletName)
      await walletSource.value.connectWallet(walletProvider)
      if (await setupProvider(walletProvider)) {
        if (connectCallback.value) {
          const address = await state.signer?.getAddress()
          await connectCallback.value(address, false)
        }
        walletConnected.value = true
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      connectError.value = error.message
    } finally {
      loadingAccount.value = false
    }
  }

  const disconnect = () => {
    state.provider = undefined
    walletConnected.value = false
    wrongNetwork.value = false
    if (disconnectCallback.value) {
      disconnectCallback.value()
    }
  }

  const disconnectWallet = async () => {
    disconnect()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = (method: string, params: any[]): any | undefined => {
    verifyProvider()
    const requestFn = state.provider?.provider.request
    if (requestFn) {
      return requestFn({ method, params })
    }
    return undefined
  }

  const getTx = (hash: string) => {
    verifyProvider()
    return state.provider?.getTransaction(hash)
  }

  const getTxReceipt = (hash: string) => {
    verifyProvider()
    return state.provider?.getTransactionReceipt(hash)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getError = (exception: any) => walletSource.value.getError(exception)

  const getBalance = (address: string) => {
    verifyProvider()
    return state.provider?.getBalance(address)
  }

  const toEth = (val: number | Big | string) => {
    const wei = Big(val.toString())
    return wei.div(Big('1000000000000000000')).toNumber()
  }
  const toEthDisplay = (val: number | Big | string) => toEth(val).toLocaleString()
  const toWei = (val: number | Big | string) => {
    const eth = Big(val.toString())
    return eth.times(Big('1000000000000000000')).toString()
  }

  const getSigner = () => state.signer

  const subscribeProvider = async (provider: Web3Provider) => {
    if (!provider.on) {
      console.log('Provider has no "on" method')
      return
    }
    provider.on('close', () => disconnect())
    provider.on('accountsChanged', async (accounts) => {
      if (accountsChangedCallback.value) {
        await accountsChangedCallback.value(accounts)
      }
    })
    provider.on('chainChanged', async (chainId) => {
      chainId.value = chainId
      if (chainChangedCallback.value) {
        await chainChangedCallback.value(chainId)
      }
    })
  }

  return {
    // Callbacks
    onChainChanged,
    onAccountsChanged,
    onSetupProvider,
    onConnect,
    onDisconnect,
    // Reactive variables
    loadingAccount,
    connectError,
    wrongNetwork,
    walletConnected,
    // Methods
    connectWallet,
    reconnectWallet,
    disconnectWallet,
    request,
    getTx,
    getTxReceipt,
    getSigner,
    getError,
    getBalance,
    toEth,
    toEthDisplay,
    toWei,
  }
}
