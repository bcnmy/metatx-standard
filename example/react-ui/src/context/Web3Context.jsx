import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

export const Web3Context = React.createContext({});
export const useWeb3Context = () => useContext(Web3Context);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '196440d5d02d41dfa2a8ee5bfd2e96bd',
    }
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

let inj_provider;

export const Web3Provider = ({ children }) => {
  const [web3State, setWeb3State] = useState({});
  const { providerChainId, ethersProvider, account } = web3State;
  const [loading, setLoading] = useState(true);

  const setWeb3Provider = useCallback(async (prov, initialCall = false) => {
    try {
      if (prov) {
        const web3Provider = new Web3(prov);
        // console.log(prov)
        inj_provider = web3Provider;
        // console.log(inj_provider);
        const provider = new ethers.providers.Web3Provider(
          web3Provider.currentProvider,
        );
        const chainId = Number(prov.chainId);
        
        if (initialCall) {
          const signer = provider.getSigner();
          const gotAccount = await signer.getAddress();
          // console.log(gotAccount)
          setWeb3State(_old => ({
            account: gotAccount,
            ethersProvider: provider,
            providerChainId: chainId,
          }));
        } else {
          // console.log(prov.chainId)
          setWeb3State(_old => ({
            ..._old,
            ethersProvider: provider,
            providerChainId: Number(prov.chainId),
          }));
        }
      }
    } catch (error) {
      console.log({ web3ModalError: error });
    }
  }, []);

  const connectWeb3 = useCallback(async () => {
    try {
      setLoading(true);
      console.log("connecting..")

      const modalProvider = await web3Modal.connect();
      console.log(modalProvider)

      await setWeb3Provider(modalProvider, true);

      // Subscribe to accounts change
      modalProvider.on('accountsChanged', accounts => {
        setWeb3State(_old => ({
          ..._old,
          account: accounts[0],
        }));
      });

      // Subscribe to chainId change
      modalProvider.on('chainChanged', _chainId => {
        setWeb3Provider(modalProvider);
      });
    } catch (error) {
      console.log({ web3ModalError: error });
    }
    setLoading(false);
  }, [setWeb3Provider]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setWeb3State({});
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
    if (web3Modal.cachedProvider) {
      connectWeb3();
    } else {
      setLoading(false);
    }
  }, [connectWeb3]);

  return (
    <Web3Context.Provider
      value={{
        ethersProvider,
        connectWeb3,
        loading,
        disconnect,
        providerChainId,
        account,
        inj_provider
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};