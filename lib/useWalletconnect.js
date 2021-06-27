
// import * as WalletConnectProvider from '@walletconnect/web3-provider';

export default function useWalletconnect(config) {
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
  };
  const connectWallet = async (provider) => {
  };
  const getError = (error) => {
    return 'errors.unknown';
  };
  return { getProvider, getError, connectWallet };
};
