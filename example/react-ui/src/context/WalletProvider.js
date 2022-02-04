import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Bitski } from "bitski";

let config = {
  contract: {
    address: "0x853bfD0160d67DF13a9F70409f9038f6473585Bd",
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "userAddress",
            type: "address",
          },
          {
            indexed: false,
            internalType: "addresspayable",
            name: "relayerAddress",
            type: "address",
          },
          {
            indexed: false,
            internalType: "bytes",
            name: "functionSignature",
            type: "bytes",
          },
        ],
        name: "MetaTransactionExecuted",
        type: "event",
      },
      {
        inputs: [
          { internalType: "address", name: "userAddress", type: "address" },
          { internalType: "bytes", name: "functionSignature", type: "bytes" },
          { internalType: "bytes32", name: "sigR", type: "bytes32" },
          { internalType: "bytes32", name: "sigS", type: "bytes32" },
          { internalType: "uint8", name: "sigV", type: "uint8" },
        ],
        name: "executeMetaTransaction",
        outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getNonce",
        outputs: [{ internalType: "uint256", name: "nonce", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getQuote",
        outputs: [
          { internalType: "string", name: "currentQuote", type: "string" },
          { internalType: "address", name: "currentOwner", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "quote",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "string", name: "newQuote", type: "string" }],
        name: "setQuote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
  apiKey: {
    test: "cNWqZcoBb.4e4c0990-26a8-4a45-b98e-08101f754119",
    prod: "8nvA_lM_Q.0424c54e-b4b2-4550-98c5-8b437d3118a9",
  },
};

const WalletProviderContext = createContext(null);

const WalletProviderProvider = (props) => {
  const [walletProvider, setWalletProvider] = useState();

  const [signer, setSigner] = useState();

  const [web3Modal, setWeb3Modal] = useState();

  const [rawEthereumProvider, setRawEthereumProvider] = useState();

  const [accounts, setAccounts] = useState();
  const [currentChainId, setCurrentChainId] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (
      rawEthereumProvider &&
      walletProvider &&
      currentChainId &&
      accounts &&
      accounts[0] &&
      accounts[0].length > 0
    ) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [rawEthereumProvider, walletProvider, currentChainId, accounts]);

  useEffect(() => {
    if (!walletProvider) return;
    setSigner(walletProvider.getSigner());
  }, [walletProvider]);

  useEffect(() => {
    setWeb3Modal(
      new Web3Modal({
        // network: "mumbai", // optional
        cacheProvider: true, // optional
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider, // required
            options: {
              infuraId:
                "https://mainnet.infura.io/v3/c9c349cef85a436eaad2f5ef6c067f3a", // required
            },
          },
          bitski: {
            package: Bitski, // required
            options: {
              clientId: "098b15e4-d788-4503-ad6f-586a5e59ba82", // required
              callbackUrl: "http://localhost:3000/bitskicallback", // required
            },
          },
        },
      })
    );
  }, []);

  // because provider does not fire events initially, we need to fetch initial values for current chain from walletProvider
  // subsequent changes to these values however do fire events, and we can just use those event handlers
  useEffect(() => {
    if (!walletProvider) return;
    (async () => {
      let { chainId } = await walletProvider.getNetwork();
      let accounts = await walletProvider.listAccounts();
      setAccounts(accounts.map((a) => a.toLowerCase()));
      setCurrentChainId(chainId);
    })();
  }, [walletProvider]);

  const reinit = (changedProvider) => {
    setWalletProvider(new ethers.providers.Web3Provider(changedProvider));
  };

  // setup event handlers for web3 provider given by web3-modal
  // this is the provider injected by metamask/fortis/etc
  useEffect(() => {
    if (!rawEthereumProvider) return;

    // Subscribe to accounts change
    rawEthereumProvider.on("accountsChanged", (accounts) => {
      // console.log(accounts);
      setAccounts(accounts.map((a) => a.toLowerCase()));
      reinit(rawEthereumProvider);
    });

    // Subscribe to chainId change
    rawEthereumProvider.on("chainChanged", (chainId) => {
      // console.log(chainId);
      setCurrentChainId(chainId);
      reinit(rawEthereumProvider);
    });

    // Subscribe to provider connection
    rawEthereumProvider.on("connect", (info) => {
      // console.log(info);
      setCurrentChainId(info.chainId);
      reinit(rawEthereumProvider);
    });

    // Subscribe to provider disconnection
    rawEthereumProvider.on("disconnect", (error) => {
      console.error(error);
    });
  }, [rawEthereumProvider]);

  const connect = useCallback(async () => {
    if (!web3Modal) {
      console.error("Web3Modal not initialized.");
      return;
    }
    let provider = await web3Modal.connect();
    setRawEthereumProvider(provider);
    setWalletProvider(new ethers.providers.Web3Provider(provider));
  }, [web3Modal]);

  const disconnect = useCallback(async () => {
    if (!web3Modal) {
      console.error("Web3Modal not initialized.");
      return;
    }
    web3Modal.clearCachedProvider();
    setRawEthereumProvider(undefined);
    setWalletProvider(undefined);
  }, [web3Modal]);

  return (
    <WalletProviderContext.Provider
      value={{
        rawEthereumProvider,
        walletProvider,
        signer,
        web3Modal,
        connect,
        disconnect,
        accounts,
        currentChainId,
        isLoggedIn,
      }}
      {...props}
    />
  );
};

const useWalletProvider = () => useContext(WalletProviderContext);
export { WalletProviderProvider, useWalletProvider };
