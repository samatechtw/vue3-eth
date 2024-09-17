import { Signer, TransactionResponse, TransactionReceipt, BrowserProvider } from 'ethers'
import { Ref, ref } from 'vue'
import {
  useMetamask,
  useWalletconnect,
  ChainState,
  IProviderConfig,
  Provider,
} from './providers'

export interface IUseChain {
  // Callbacks
  onChainChanged: (callback: ChainChangedCallback) => void
  onAccountsChanged: (callback: AccountsChangedCallback) => void
  onSetupProvider: (callback: SetupProviderCallback) => void
  onConnect: (callback: ConnectCallback) => void
  onDisconnect: (callback: DisconnectCallback) => void
  // Reactive variables
  loadingAccount: Ref<boolean>
  connectError: Ref<string | undefined>
  wrongNetwork: Ref<boolean>
  walletConnected: Ref<boolean>
  wallets: Ref<string[]>
  // Methods
  connectWallet: (walletName: string) => Promise<void>
  reconnectWallet: (walletName: string) => Promise<void>
  disconnectWallet: () => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: (method: string, params: any[]) => any | undefined
  getTx: (hash: string) => Promise<TransactionResponse | null>
  getTxReceipt: (hash: string) => Promise<TransactionReceipt | null>
  getSigner: () => Signer | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getError: (e: unknown) => any
  getBalance: (address: string) => Promise<bigint | undefined>
}

function chainInit(provider: Provider): BrowserProvider {
  return new BrowserProvider(provider)
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
const wallets = ref<string[]>([])
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
  }

  const setupProvider = async (walletProvider: Provider) => {
    wrongNetwork.value = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state.provider = chainInit(walletProvider) as any
    if (!state.provider) {
      return
    }
    state.signer = await state.provider.getSigner()
    setupProviderCallback.value?.(state.signer)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await subscribeProvider(walletProvider as any)

    const network = await state.provider.getNetwork()
    chainId.value = network?.chainId
    if (ethChainId && chainId.value.toString() !== ethChainId) {
      wrongNetwork.value = true
      return false
    }
    return true
  }

  const reconnectWallet = async (walletName: string) => {
    loadingAccount.value = true
    try {
      setupWallet(walletName)
      if (!walletSource.value?.isConnected()) {
        return false
      }
      const provider = await walletSource.value.getProvider()
      if (await setupProvider(provider)) {
        wallets.value = await walletSource.value.getAccounts(provider)
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
      setupWallet(walletName)
      const provider = await walletSource.value.getProvider()
      await walletSource.value.connectWallet(provider)
      if (await setupProvider(provider)) {
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
    disconnectCallback.value?.()
  }

  const disconnectWallet = async () => {
    disconnect()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = (method: string, params: any[]): any | undefined => {
    verifyProvider()
    const requestFn = state.provider?.provider.send
    if (requestFn) {
      return requestFn(method, params)
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
  const getError = (exception: unknown) => walletSource.value.getError(exception)

  const getBalance = (address: string): Promise<bigint> | undefined => {
    verifyProvider()
    return state.provider?.getBalance(address)
  }

  const getSigner = () => state.signer

  const subscribeProvider = async (provider: BrowserProvider) => {
    if (!provider.on) {
      console.log('Provider has no "on" method')
      return
    }
    provider.on('accountsChanged', async (accounts: string[]) => {
      wallets.value = [...accounts]
      if (accounts?.length === 0) {
        disconnect()
      } else {
        await accountsChangedCallback.value?.(accounts)
      }
    })
    provider.on('chainChanged', async (chainId) => {
      chainId.value = chainId
      await chainChangedCallback.value?.(chainId)
    })
    provider.on('disconnect', async () => {
      disconnect()
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
    wallets,
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
  }
}
