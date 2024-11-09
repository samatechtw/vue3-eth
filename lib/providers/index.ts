export * from './i-provider'
export * from './provider-config'
export * from './use-metamask'
export * from './use-walletconnect'

import {
  hexlify,
  isHexString,
  isAddress,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from 'ethers'

export const ethers = {
  hexlify,
  isHexString,
  isAddress,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
}
