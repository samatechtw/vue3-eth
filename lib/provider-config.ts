import { providers, Signer } from 'ethers'

export interface IProviderConfig {
  ethChainId?: string
}

export type Provider = providers.ExternalProvider
export type Web3Provider = providers.Web3Provider

export interface ChainState {
  provider: Web3Provider | undefined
  signer: Signer | undefined
  loaded: boolean
}
