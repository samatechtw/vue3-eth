// TODO -- implement walletconnect
// import * as WalletConnectProvider from '@walletconnect/web3-provider';

import { IProvider } from './i-provider'
import { IProviderConfig, Provider } from './provider-config'
import { BrowserProvider } from 'ethers'

export const useWalletconnect = (_config?: IProviderConfig): IProvider => {
  const getProvider = (): Promise<BrowserProvider> => {
    /*
    const provider = new WalletConnectProvider.WalletConnectProvider({
      infuraId: config.infuraId,
    });
    provider.connector.on('display_uri', (err, payload) => {
      const uri = payload.params[0];
      console.log('WALLETCONNECT QRCODE', uri);
    });
    */
    throw new Error('errors.no_walletconnect')
  }

  const isConnected = async (): Promise<boolean> => {
    return false
  }

  const connectWallet = async (_provider: Provider): Promise<void> => {
    // TODO
  }
  const getAccounts = async (_provider: Provider): Promise<string[]> => {
    return []
  }
  const getError = (_error: unknown) => {
    return 'errors.unknown'
  }
  return { getProvider, isConnected, getError, connectWallet, getAccounts }
}
