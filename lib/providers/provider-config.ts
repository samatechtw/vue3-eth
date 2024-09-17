import { BrowserProvider, Eip1193Provider, Signer } from 'ethers'

export interface IProviderConfig {
  ethChainId?: string
}

export type Provider = Eip1193Provider

export interface ChainState {
  provider: BrowserProvider | undefined
  signer: Signer | undefined
  loaded: boolean
}
