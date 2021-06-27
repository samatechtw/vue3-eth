import detectEthereumProvider from '@metamask/detect-provider';

export default function useMetamask(config) {

  const getProvider = async () => {
    const provider = await detectEthereumProvider();
    if(provider) {

      provider.on('networkChanged', async (_networkId) => {
        location.reload();
      });
      return provider;
    } else {
      throw new Error('errors.no_metamask');
    }
  };

  const connectWallet = async (provider) => {
    try {
      await provider.request({
        method: 'wallet_requestPermissions',
        params: [{eth_accounts: {}}],
      });
      await provider.request({
        method: 'eth_requestAccounts',
        params: [{ eth_accounts: {}}],
      });
    } catch(e) {
      throw new Error(getError(e));
    }
  };

  const getError = (error) => {
    if(error.code === 4001) {
      return 'errors.user_rejected';
    } else if(error.code === -32603) {
      // Hacky check for nonce issue
      if(error.message.includes('-32000')) {
        return 'errors.nonce_high';
      }
      return 'errors.tx_reverted';
    }
    return 'errors.unknown';
  };

  return { getProvider, getError, connectWallet };
};
