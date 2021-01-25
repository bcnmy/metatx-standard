import "./App.css";
import "react-notifications/lib/notifications.css";

import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import React, { useCallback, useEffect, useState } from "react";

import { BeaconWallet } from "@taquito/beacon-wallet";
import { BiconomyDappClient } from "mexa-tezos-sdk";
import Button from "@material-ui/core/Button";
import { TezosToolkit } from "@taquito/taquito";
import { config } from "./config";

function App() {
  const [quote, setQuote] = useState("This is a default quote");
  const [owner, setOwner] = useState("Default Owner Address");
  const [newQuote, setNewQuote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);
  const [quoteContract, setQuoteContract] = useState();
  const [walletConnected, setWalletConnected] = useState(false);

  const options = {
    name: "Quote DApp",
    iconUrl: "https://avatars0.githubusercontent.com/u/50363773?s=60&v=4",
    preferredNetwork: config.network,
  };
  const bcnmyDappClient = new BiconomyDappClient(options, {
    apiKey: "UQsMrcyf2.4587a48b-0f1f-48e0-8507-76efc3b2a290",
  });
  const wallet = new BeaconWallet(options);
  wallet.client = bcnmyDappClient;

  const Tezos = new TezosToolkit(config.rpcUrl);

  useEffect(() => {
    async function init() {
      // Request permissions for DApp on start
      await handleConnect();
      const walletAddress = await wallet.getPKH();

      // Get contract
      Tezos.setWalletProvider(wallet);
      const contract = await Tezos.wallet.at(config.quoteContractAddress);

      setSelectedAddress(walletAddress);
      setQuoteContract(contract);

      const metaTxEnabled = await wallet.client.isMetaTxEnabled();
      setMetaTxEnabled(metaTxEnabled);
    }
    init();
  }, []);

  useEffect(() => {
    async function updateCurrentQuote() {
      await getQuoteFromNetwork();
    }

    updateCurrentQuote();
  }, [quoteContract]);

  const onQuoteChange = (event) => {
    setNewQuote(event.target.value);
  };

  const onSubmit = async (event) => {
    if (newQuote !== "" && quoteContract) {
      const setQuoteMethod = quoteContract.methods["default"](newQuote);

      if (metaTxEnabled) {
        console.log("Sending meta transaction");

        const result = await setQuoteMethod.send();
        showInfoMessage(`Transaction queued with id: ${result.opHash}`);

        const { opHash, counter } = await wallet.client.getTransactionHash(
          result.opHash,
          config.chainId
        );
        showInfoMessage(`Transaction sent to blockchain with hash ${opHash}`);

        await wallet.client.confirmation(opHash, counter);
        showSuccessMessage("Transaction confirmed");
        getQuoteFromNetwork();
      } else {
        console.log("Sending normal transaction");
        const result = await setQuoteMethod.send();
        showInfoMessage(
          `Transaction sent to blockchain with hash ${result.opHash}`
        );

        await result.confirmation();
        showSuccessMessage("Transaction confirmed");
        getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const getQuoteFromNetwork = async () => {
    if (!quoteContract) {
      return;
    }

    try {
      const { baseState } = await quoteContract.storage();
      const { quote: currentQuote, owner: currentOwner } = baseState;
      setQuote(currentQuote.toString());
      setOwner(currentOwner);
    } catch {
      showErrorMessage("Not able to get quote information from Network");
    }
  };

  const showErrorMessage = (message) => {
    NotificationManager.error(message, "Error", 5000);
  };

  const showSuccessMessage = (message) => {
    NotificationManager.success(message, "Message", 3000);
  };

  const showInfoMessage = (message) => {
    NotificationManager.info(message, "Info", 3000);
  };

  const handleDisconnect = useCallback(async () => {
    await wallet.disconnect();
    setWalletConnected(false);
  });

  const handleConnect = useCallback(async () => {
    await wallet.requestPermissions({
      network: {
        type: config.network,
      },
    });

    setWalletConnected(true);
  });

  const toggleMetaTx = useCallback(async () => {
    const status = await wallet.client.toggleMetaTxStatus();
    console.log("status: ", status);
    setMetaTxEnabled(status);
  });

  return (
    <div className="App">
      <section className="main">
        <div className="mb-wrap mb-style-2">
          <blockquote cite="http://www.gutenberg.org/ebboks/11">
            <p>{quote}</p>
          </blockquote>
        </div>

        <div className="mb-attribution">
          <p className="mb-author">{owner}</p>
          {selectedAddress.toLowerCase() === owner.toLowerCase() && (
            <cite className="owner">You are the owner of the quote</cite>
          )}
          {selectedAddress.toLowerCase() !== owner.toLowerCase() && (
            <cite>You are not the owner of the quote</cite>
          )}
        </div>

        {walletConnected ? (
          <div className="mb-attribution">
            <p className="mb-wallet-address">Wallet Address</p>
            <p className="selected-wallet-address">{selectedAddress}</p>
          </div>
        ) : null}
      </section>
      <section>
        <div className="submit-container">
          <div className="submit-row">
            <input
              type="text"
              placeholder="Enter your quote"
              onChange={onQuoteChange}
              value={newQuote}
            />
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </section>

      <br />
      <br />
      {walletConnected ? (
        <Button variant="contained" color="primary" onClick={handleDisconnect}>
          Disconnect
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={handleConnect}>
          Connect
        </Button>
      )}

      <br />
      <br />
      {metaTxEnabled ? (
        <Button variant="contained" color="primary" onClick={toggleMetaTx}>
          Disable meta tx
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={toggleMetaTx}>
          Enable meta tx
        </Button>
      )}
      <NotificationContainer />
    </div>
  );
}

export default App;
