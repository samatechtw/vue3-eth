import detectEthereumProvider from '@metamask/detect-provider'
import { IProviderConfig, Provider } from './provider-config'
import { BrowserProvider } from 'ethers'
import { IProvider } from './i-provider'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum: any
  }
}

export const useMetamask = (_config?: IProviderConfig): IProvider => {
  const getProvider = async (): Promise<BrowserProvider> => {
    try {
      const provider = await detectEthereumProvider<BrowserProvider>()
      if (provider) {
        provider.on('chainChanged', async (_networkId: number) => {
          location.reload()
        })
        return provider
      }
      throw new Error('errors.no_metamask')
    } catch (_e) {
      throw new Error('errors.no_metamask')
    }
  }

  const isConnected = async (): Promise<boolean> => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return false
    }
    try {
      return window.ethereum.isConnected()
    } catch (_e) {
      return false
    }
  }

  const connectWallet = async (provider: Provider) => {
    if (!provider.request) {
      throw new Error('Invalid provider, missing request')
    }
    try {
      await provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
      await provider.request({
        method: 'eth_requestAccounts',
        params: [{ eth_accounts: {} }],
      })
    } catch (e) {
      throw new Error(getError(e))
    }
  }

  const getAccounts = async (): Promise<string[]> => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      return []
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      return accounts || []
    } catch (e) {
      throw new Error(getError(e))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getError = (error: any) => {
    if (error.code === 4001) {
      return 'errors.user_rejected'
    } else if (error.code === -32603) {
      // Hacky check for nonce issue
      if (error.message.includes('-32000')) {
        return 'errors.nonce_high'
      }
      return error.message
    }
    return 'errors.unknown'
  }

  return { getProvider, getAccounts, isConnected, getError, connectWallet }
}
