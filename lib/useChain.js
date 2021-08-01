import { ethers } from 'ethers/lib.esm';
import Big from 'big.js';
import { ref } from 'vue';
import useMetamask from './useMetamask';
import useWalletconnect from './useWalletconnect';

Big.PE = 1000;

function chainInit(provider) {
  return new ethers.providers.Web3Provider(provider);
}

// TODO non-reactive due to issue with proxying ethers stuff
const state = {
  provider: null,
  signer: null,
  loaded: false,
};

const chainId = ref(null);
const loadingAccount = ref(false);
const walletConnected = ref(false);
const wrongNetwork = ref(false);
const walletSource = ref(null);
const connectError = ref(null);

const connectCallback = ref(null);
const disconnectCallback = ref(null);
const chainChangedCallback = ref(null);
const accountsChangedCallback = ref(null);
const setupProviderCallback = ref(null);

// Callback helpers
const onConnect = (callback) => {
  connectCallback.value = callback;
};

const onDisconnect = (callback) => {
  disconnectCallback.value = callback;;
};

const onChainChanged = (callback) => {
  chainChangedCallback.value = callback;
};

const onAccountsChanged = (callback) => {
  accountsChangedCallback.value = callback;
};

const onSetupProvider = (callback) => {
  setupProviderCallback.value = callback;
};

export default function useChain(config) {
  const { ethChainId } = config;

  const verifyProvider = () => {
    if(!state.provider) {
      throw new Error('errors.not_connected');
    }
  }

  const setupWallet = async (walletName) => {
    connectError.value = null;
    if(walletName === 'metamask') {
      walletSource.value = useMetamask(config);
    } else if(walletName === 'walletconnect') {
      walletSource.value = useWalletconnect(config);
    }
    return walletSource.value.getProvider();
  };

  const setupProvider = async (walletProvider) => {
    wrongNetwork.value = false;
    state.provider = chainInit(walletProvider);
    state.signer = state.provider.getSigner();
    if(setupProviderCallback.value) {
      setupProviderCallback.value(state.signer);
    }
    await subscribeProvider(state.provider);

    const network = await state.provider.getNetwork();
    chainId.value = network.chainId;
    if(ethChainId && (chainId.value.toString() !== ethChainId)) {
      wrongNetwork.value = true;
      return false;
    }
    return true;
  };

  const reconnectWallet = async (walletName) => {
    loadingAccount.value = true;
    try {
      const walletProvider = await setupWallet(walletName);
      if(await setupProvider(walletProvider)) {
        if(connectCallback.value) {
          const address = await state.signer.getAddress();
          await connectCallback.value(address, true);
        }
        walletConnected.value = true;
      }
    } catch(e) {
      console.log('Fail to reconnect', e);
      disconnect();
    } finally {
      loadingAccount.value = false;
    }
  };

  const connectWallet = async (walletName) => {
    loadingAccount.value = true;
    try {
      const walletProvider = await setupWallet(walletName);
      await walletSource.value.connectWallet(walletProvider);
      if(await setupProvider(walletProvider)) {
        if(connectCallback.value) {
          const address = await state.signer.getAddress();
          await connectCallback.value(address, false);
        }
        walletConnected.value = true;
      }
    } catch(error) {
      connectError.value = error.message;
    } finally {
      loadingAccount.value = false;
    }
  };

  const disconnect = () => {
    state.provider = null;
    walletConnected.value = false;
    wrongNetwork.value = false;
    if(disconnectCallback.value) {
      disconnectCallback.value();
    }
  };

  const disconnectWallet = async () => {
    if(state.provider && state.provider.close) {
      await state.provider.close();
    }
    disconnect();
  };

  const request = (method, params) => {
    verifyProvider();
    return state.provider.provider.request(method, params)
  };

  const getTx = (hash) => {
    verifyProvider();
    return state.provider.getTransaction(hash);
  };

  const getTxReceipt = (hash) => {
    verifyProvider();
    return state.provider.getTransactionReceipt(hash);
  };

  const getError = exception => (
    walletSource.value.getError(exception)
  );

  const getBalance = (address) => {
    verifyProvider();
    return state.provider.getBalance(address)
  };

  const toEth = (val) => {
    let wei = Big(val.toString());
    return wei.div(Big('1000000000000000000')).toNumber();
  };
  const toEthDisplay = (val) => (
    toEth(val).toLocaleString()
  );
  const toWei = (val) => {
    const eth = Big(val.toString());
    return eth.times(Big('1000000000000000000')).toString();
  };

  const getSigner = () => state.signer;

  const subscribeProvider = async (provider) => {
    if(!provider.on) {
      console.log('Provider has no "on" method');
      return;
    }
    provider.on('close', () => disconnect());
    provider.on('accountsChanged', async (accounts) => {
      if(accountsChangedCallback.value) {
        await accountsChangedCallback.value(accounts);
      }
    });
    provider.on('chainChanged', async (chainId) => {
      chainId.value = chainId;
      if(chainChangedCallback.value) {
        await chainChangedCallback.value(chainId);
      }
    });
  };

  return {
    // Callbacks
    onChainChanged,
    onAccountsChanged,
    onSetupProvider,
    onConnect,
    onDisconnect,
    // Reactive variables
    loadingAccount,
    connectError,
    wrongNetwork,
    walletConnected,
    // Methods
    connectWallet,
    reconnectWallet,
    disconnectWallet,
    request,
    getTx,
    getTxReceipt,
    getSigner,
    getError,
    getBalance,
    toEth,
    toEthDisplay,
    toWei,
  };
};
