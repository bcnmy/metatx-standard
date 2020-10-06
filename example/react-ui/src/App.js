import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";
import {toBuffer} from "ethereumjs-util";
var abi = require('ethereumjs-abi')

const { config } = require("./config");
let chainId = "42";
let web3;
let contract;

function App() {
  const [quote, setQuote] = useState("This is a default quote");
  const [owner, setOwner] = useState("Default Owner Address");
  const [newQuote, setNewQuote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [error, setError] =  useState("");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);
  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined"
      ) {
        // Ethereum user detected. You can now use the provider.
        const provider = window["ethereum"];
        // const biconomy = new Biconomy(provider,{apiKey: "YQ45IuL1p.664e2911-02b3-4920-98ac-f9e872f4e577", debug: true});
        await provider.enable();
        if (provider.networkVersion === chainId) {
          web3 = new Web3(provider);

          // biconomy.onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );
            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function(accounts) {
              setSelectedAddress(accounts[0]);
            });
          // }).onEvent(biconomy.ERROR, (error, message) => {
          //   console.error(error);
          //   setError(JSON.stringify(error));
          //   showErrorMessage("Error while initializing Biconomy. Please contact Biconomy team.");
          //   // Handle error while initializing mexa
          // });
        } else {
          showErrorMessage("Please change the network in metamask to Kovan");
        }
      } else {
        showErrorMessage("Your browser is not web3 enabled");
      }
    }
    init();
  }, []);

  const onQuoteChange = event => {
    setNewQuote(event.target.value);
  };

  const onSubmit = async event => {
    if (newQuote != "" && contract) {
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;
        let nonce = await contract.methods.getNonce(userAddress).call();
        let functionSignature = contract.methods.setQuote(newQuote).encodeABI();

        let messageToSign = constructMetaTransactionMessage(nonce, chainId, functionSignature, config.contract.address);
        const signature = await web3.eth.personal.sign(
          "0x" + messageToSign.toString("hex"),
          userAddress
        );

        console.info(`User signature is ${signature}`);
        let { r, s, v } = getSignatureParameters(signature);

        sendTransaction(userAddress, functionSignature, r, s, v);
      } else {
        showSuccessMessage("Transaction confirmed");    
      }
    } else {
      showErrorMessage("Error while sending");
    }
  };


  const constructMetaTransactionMessage = (nonce, chainId, functionSignature, contractAddress) => {
    return abi.soliditySHA3(
        ["uint256","address","uint256","bytes"],
        [nonce, contractAddress, chainId, toBuffer(functionSignature)]
    );
  }

  const getSignatureParameters = signature => {
    if (!web3.utils.isHexStrict(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v
    };
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

  const sendTransaction = async (userAddress, functionData, r, s, v) => {
    if (web3 && contract) {
      try {
        fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key" : "YQ45IuL1p.664e2911-02b3-4920-98ac-f9e872f4e577",
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            "to": "0x1E1c36546F6ddD71e8e6aEDf135B82F7EEaA08b9",
            "apiId": "7417bfd3-39d3-4b53-9b38-58c8a1e92351",
            "params": [
              userAddress, functionData, r, s, v
            ],
            "from": userAddress
          })
        })
        .then(response=>response.json())
        .then(function(result) {
          console.log(result);
          showInfoMessage(`Transaction sent by relayer with hash ${result.txHash}`);

        })
	      .catch(function(error) {
	        console.log(error)
	      });
      } catch (error) {
        console.log(error);
      }
    }
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
      <div>{error}</div>
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
