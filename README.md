<h2 align='center'>@samatech/vue3-eth</h2>

<p align='center'>Vue3 library for building Dapps in an ES module environment</p>

<p align='center'>
<a href='https://www.npmjs.com/package/@samatech/vue3-eth'>
  <img src='https://img.shields.io/npm/v/@vue3-eth/vue3-eth?color=222&style=flat-square'>
</a>
</p>

<br>

## Description

This library relies on the Vue3 composition API. Ethereum activity is handled by [Ethers](https://github.com/ethers-io/ethers.js/).

Currently, only Metamask is supported as a wallet provider, but work is in progress to integrate WalletConnect and others.

## Usage

### Install

We recommend [PNPM](https://pnpm.io/) for Javascript package management.

```bash
pnpm i -D @samatech/vue3-eth
```

### Configuration

The only configuration is `ethChainId`, which is an optional string indicating the intended network to connect to. It's only used for error checking, which is skipped if left out.

```javascript
import { useChain } from '@samatech/vue3-eth';

const chain = useChain({ ethChainId: 'ropsten' });
```

### Callbacks
Callbacks are included in the object returned by `useChain`.

**onSetupProvider**
```javascript
const { onSetupProvider } = useChain();

onSetupProvider((signer) => {
  // The eth provider is connected. Store the signer if you need it later
  // Make sure "signer" is NOT reactive, this will break ethers.sj
});
```

**onConnect**
```javascript
const { onConnect } = useChain();

onConnect((address) => {
  // ethers.js setup complete, you can now use all library functions
});
```

**onDisconnect**
```javascript
const { onDisconnect } = useChain();

onDisconnect(() => {
  // Disconnected from blockchain
  // "connectWallet" or "reconnectWallet" must be called to use the library again
});
```

**onChainChanged**
```javascript
const { onChainChanged } = useChain();

onChainChanged((chainId) => {
  // The user changed the blockchain/network
});
```

**onAccountsChanged**
```javascript
const { onAccountsChanged } = useChain();

onAccountsChanged((accounts) => {
  // The user switched accounts
});
```

### Reactive variables

**loadingAccount** - Boolean indicating whether a connection is in progress. (Default `false`)

**connectError** - String/key that represents the current error state. (Default `null`)

Error descriptions:
- `errors.no_metamask` - Metamask is not available in the current browser context
- `errors.user_rejected` - The user rejected the transaction
- `errors.nonce_high` - The Metamask account nonce doesn't match the expected value. This happens when a local testnet is reset after use, the solution is to go to Metamask options -> Advanced -> Reset Account
- `errors.tx_reverted` - The transaction failed for some reason
- `errors.unknown` - An unknown error occurred

**wrongNetwork** - Boolean, true if connected to a network not specified by `ethChainId` config

**walletConnected** - Boolean, true if currently connected (after `onConnect`, before `onDisconnect`)

### Methods

**connectWallet(walletName: string)**
- Connect to the blockchain. `walletName` is the type of wallet, which can be `'metamask'` or `'walletconnect'`

**reconnectWallet(walletName: string)**
- Attempts to automatically reconnect to `walletName`

**disconnectWallet**
- Disconnect the current wallet

**getTx(hash: string)**
- Gets a transaction object from a transaction hash

**getTxReceipt(hash: string)**
- Gets a transaction receipt object from a transaction hash

**getSigner**
- Gets the current signer

**getError(e: Exception)**
- Converts an exception to an error key

**toEth(value: any)**
- Utility function for converting a value from Wei to Eth. Arg must be a string or implement `toString`

**toEthDisplay(value: any)**
- Utility function that converts a value from Wei to Eth, and returns a human readable number

**toWei(value: any)**
- Utility function for converting a value from Eth to Wei (1 / 1e18). Arg must be a string or implement `toString`

## Example

See the `example` directory (TBD).

## License

MIT License © 2021 [SamaTech Taiwan](https://github.com/samatechtw)
