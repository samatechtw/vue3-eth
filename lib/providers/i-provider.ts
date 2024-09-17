import { BrowserProvider } from 'ethers'
import { Provider } from './provider-config'

export interface IProvider {
  getProvider: () => Promise<BrowserProvider>
  isConnected: () => Promise<boolean>

  connectWallet: (provider: Provider) => Promise<void>
  getAccounts: (provider: Provider) => Promise<string[]>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getError: (error: any) => string
}
