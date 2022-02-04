import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// @ts-ignore
import { Biconomy } from "@biconomy/mexa";
import { useWalletProvider } from "./WalletProvider";
import { ethers } from "ethers";

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

// interface IBiconomyContext {
//   biconomy: undefined | any;
//   isBiconomyReady: boolean;
//   isBiconomyEnabled: boolean;
//   isBiconomyToggledOn: boolean;
//   setIsBiconomyToggledOn: (isOn: boolean) => void;
//   isBiconomyAllowed: boolean;
// }

const NETWORK_AGNOSTIC = true;

const BiconomyContext = createContext(null);

const BiconomyProvider = (props) => {
  const { rawEthereumProvider, walletProvider } = useWalletProvider();
  // const { fromChainRpcUrlProvider, fromChain, areChainsReady } = useChains();

  const [isBiconomyReady, setIsBiconomyReady] = useState(false);

  // const isBiconomyAllowed = useMemo(
  //   () =>
  //     !!(!!fromChain?.networkAgnosticTransfer && !!fromChain.biconomy.enable),
  //   [fromChain]
  // );

  // const [isBiconomyToggledOn, setIsBiconomyToggledOn] = useState(false);

  // const isBiconomyEnabled = useMemo(
  //   () =>
  //     !!(
  //       !!fromChain?.networkAgnosticTransfer &&
  //       !!fromChain.biconomy.enable &&
  //       isBiconomyToggledOn
  //     ),
  //   [fromChain, isBiconomyToggledOn]
  // );

  // useEffect(() => {
  //   console.log({ isBiconomyEnabled });
  // }, [isBiconomyEnabled]);

  // reinitialize biconomy everytime from chain is changed
  const biconomy = useMemo(() => {
    // if biconomy is disabled for from chain, then don't initialise
    // or if from chain is not selected yet, then don't initialise
    // if (!fromChain || !fromChain.biconomy.enable || !areChainsReady) {
    //   return;
    // }

    let newBiconomy;

    // console.log({ fromChain, fromChainRpcUrlProvider });
    // if network agnostic transfers are enabled for current from chain
    // TODO: Because of bug in Biconomy SDK, fallback provider is not picked up automatically
    // So we need to redeclare Biconomy without network agnostic features to make it work properlys

    if (!rawEthereumProvider) return;
    if (NETWORK_AGNOSTIC) {
      // if (!fromChainRpcUrlProvider) return;

      newBiconomy = new Biconomy(
        new ethers.providers.JsonRpcProvider(
          "https://kovan.infura.io/v3/d126f392798444609246423b06116c77"
        ),
        {
          apiKey: config.apiKey.prod,
          debug: true,
          walletProvider: rawEthereumProvider,
        }
      );
      return newBiconomy;
    } // else setup without network agnostic features
    else {

      newBiconomy = new Biconomy(rawEthereumProvider, {
        apiKey: config.apiKey.prod,
        debug: true,
      });
    }

    return newBiconomy;
  }, [
    rawEthereumProvider,
    // fromChainRpcUrlProvider,
    // fromChain,
    // areChainsReady,
    // isBiconomyEnabled,
  ]);

  useEffect(() => {
    if (!biconomy) return;

    let onReadyListener = () => {
      // Initialize your dapp here like getting user accounts etc
      setIsBiconomyReady(true);
      console.log("BICONOMY READY");
    };

    let onErrorListener = (error, message) => {
      // Handle error while initializing mexa
      setIsBiconomyReady(false);
    };

    biconomy
      .onEvent(biconomy.READY, onReadyListener)
      .onEvent(biconomy.ERROR, onErrorListener);

    // TODO:
    // once the Biconomy SDK has been updated to include support for removing event listeners,
    // make sure to remove both these event listeners in the cleanup function to allow for GC of old instances.
    // so uncomment the below returned function
    // return () => {
    //   biconomy.removeEventListener(biconomy.READY, onReadyListener);
    //   biconomy.removeEventListener(biconomy.ERROR, onErrorListener);
    // };
  }, [biconomy]);

  return (
    <BiconomyContext.Provider
      value={{
        isBiconomyReady,
        // isBiconomyEnabled,
        // isBiconomyAllowed,
        biconomy,
        // isBiconomyToggledOn,
        // setIsBiconomyToggledOn,
      }}
      {...props}
    />
  );
};

const useBiconomy = () => useContext(BiconomyContext);
export { BiconomyProvider, useBiconomy };
