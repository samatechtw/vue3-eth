// TODO -- implement walletconnect
// import * as WalletConnectProvider from '@walletconnect/web3-provider';

import { IProviderConfig, Web3Provider } from './provider-config'

export const useWalletconnect = (_config?: IProviderConfig) => {
  const getProvider = () => {
    /*
    const provider = new WalletConnectProvider.WalletConnectProvider({
      infuraId: config.infuraId,
    });
    provider.connector.on('display_uri', (err, payload) => {
      const uri = payload.params[0];
      console.log('WALLETCONNECT QRCODE', uri);
    });
    */
  }
  const connectWallet = async (_provider: Web3Provider) => {
    // TODO
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getError = (_error: any) => {
    return 'errors.unknown'
  }
  return { getProvider, getError, connectWallet }
}
