import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";
const { config } = require("./config");
const Gsn = require("@opengsn/gsn/dist/src/relayclient/")
const RelayProvider = Gsn.RelayProvider
const configureGSN =
  require('@opengsn/gsn/dist/src/relayclient/GSNConfigurator').configureGSN
const gsnConfig = configureGSN({
    relayHubAddress: config.gsnConfig.relayhub,
    paymasterAddress: config.gsnConfig.paymaster,
    stakeManagerAddress: config.gsnConfig.stakemgr,
    gasPriceFactorPercent: 70,
    methodSuffix: '_v4',
    jsonStringifyRequest: true,
    chainId: 42,
	  relayLookupWindowBlocks: 1e5
});

let web3;
let contract;

function App() {
  const [quote, setQuote] = useState("This is a default quote");
  const [owner, setOwner] = useState("Default Owner Address");
  const [newQuote, setNewQuote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        // Ethereum user detected. You can now use the provider.
        const provider = window["ethereum"];
        const gsnProvider = new RelayProvider(provider, gsnConfig);
        web3 = new Web3(gsnProvider);
        await provider.enable();
        if (provider.networkVersion === "42") {
          contract = new web3.eth.Contract(
            config.contract.abi,
            config.contract.address
          );
          setSelectedAddress(provider.selectedAddress);
          getQuoteFromNetwork();
          provider.on("accountsChanged", function(accounts) {
            setSelectedAddress(accounts[0]);
          });
        } else {
          showErrorMessage("Please change the network in metamask to Kovan.");
        }
      } else {
        showErrorMessage("Metamask not installed");
      }
    }
    init();
  }, []);

  const onQuoteChange = event => {
    setNewQuote(event.target.value);
  };

  const onSubmit = async event => {
    if (newQuote != "" && contract) {
      contract.methods
        .setQuote(newQuote)
        .send({ from: selectedAddress })
        .on("transactionHash", function(hash) {
          showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
        })
        .once("confirmation", function(confirmationNumber, receipt) {
          showSuccessMessage("Transaction confirmed");
          getQuoteFromNetwork();
        });
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const getQuoteFromNetwork = () => {
    if (web3 && contract) {
      contract.methods
        .getQuote()
        .call()
        .then(function(result) {
          console.log(result);
          if (
            result &&
            result.currentQuote != undefined &&
            result.currentOwner != undefined
          ) {
            if (result.currentQuote == "") {
              showErrorMessage("No quotes set on blockchain yet");
            } else {
              setQuote(result.currentQuote);
              setOwner(result.currentOwner);
            }
          } else {
            showErrorMessage("Not able to get quote information from Network");
          }
        });
    }
  };

  const showErrorMessage = message => {
    NotificationManager.error(message, "Error", 5000);
  };

  const showSuccessMessage = message => {
    NotificationManager.success(message, "Message", 3000);
  };

  const showInfoMessage = message => {
    NotificationManager.info(message, "Info", 3000);
  };

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
      <NotificationContainer />
    </div>
  );
}

export default App;
