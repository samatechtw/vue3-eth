import detectEthereumProvider from '@metamask/detect-provider'
import { IProviderConfig, Provider, Web3Provider } from './provider-config'

export const useMetamask = (_config?: IProviderConfig) => {
  const getProvider = async (): Promise<Web3Provider> => {
    try {
      const providerUnknown = await detectEthereumProvider()
      const provider = providerUnknown as Web3Provider
      if (provider) {
        provider.on('networkChanged', async (_networkId: number) => {
          location.reload()
        })
        return provider
      }
      throw new Error('errors.no_metamask')
    } catch (_e) {
      throw new Error('errors.no_metamask')
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

  return { getProvider, getError, connectWallet }
}
