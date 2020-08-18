import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Biconomy from "@biconomy/mexa";

import Web3 from "web3";
let sigUtil = require("eth-sig-util");
const { config } = require("./config");
const { createWallet } = require("./gnosis/GnosisHelper");

let web3;
let contract, gnosisFactory, gnosisSafeMaster, proxyWallet;
const PROXY_ADDRESS = "PROXY_ADDRESS";

function App() {
  const [quote, setQuote] = useState("This is a default quote");
  const [owner, setOwner] = useState("Default Owner Address");
  const [newQuote, setNewQuote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        // Ethereum user detected. You can now use the provider.
        const provider = window["ethereum"];
        await provider.enable();
        if (provider.networkVersion === "4") {
          const biconomy = new Biconomy(provider,{apiKey: "xLqd3k_kl.2e36e464-b8cc-4e19-9989-d3e571e1860c", debug: true});
          web3 = new Web3(biconomy);
          // web3 = new Web3(provider);
          biconomy.onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );
            gnosisFactory = new web3.eth.Contract(
              config.gnosis.proxyFactory.abi,
              config.gnosis.proxyFactory.address
            );
            gnosisSafeMaster = new web3.eth.Contract(
              config.gnosis.safeMasterCopy.abi,
              config.gnosis.safeMasterCopy.address
            );
            let proxyAddress = "0xaDa343Cb6820F4f5001749892f6CAA9920129F2A";
            if(proxyAddress) {
              proxyWallet = new web3.eth.Contract(
                config.gnosis.safeMasterCopy.abi,
                proxyAddress
              );
              setWalletAddress(proxyAddress);
            }

            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function(accounts) {
              setSelectedAddress(accounts[0]);
            });
            // Whiltelist our DApp smart contract
            let data = {
              destinationAddresses : [
                config.contract.address.toLowerCase()
              ]
            }
            fetch("https://api.biconomy.io/api/v1/dapp/whitelist/destination", {
              method: "POST",
              body: JSON.stringify(data),
              headers: {
                "Authorization" : "User b99b1ecb-7d57-487f-a46d-d6aafef0be1a",
                'Content-Type': 'application/json;charset=utf-8'
              }
            }).then(response => {
              if(response.ok) {
                return response.json();
              } else {
                showErrorMessage("Whilelisting contract address failed");
              }
            }).then(response => {
              console.log(response);
              showSuccessMessage("Dapp whitelisted successfully");
            });

          }).onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
            console.log(error);
            showErrorMessage("Error while initializing biconomy");
          });
        } else {
          showErrorMessage("Please change the network in metamask to Kovan");
        }
      } else {
        showErrorMessage("Metamask not installed");
      }
    }
    init();
  }, []);

  const getLocalStorage = (key) => {
    if(typeof localStorage != 'undefined') {
      return localStorage.getItem(key);
    }
    return;
  }

  const setLocalStorage = (key, value) => {
    if(typeof localStorage != 'undefined') {
      if(key && value) {
        localStorage.setItem(key, value);
      }
    }
  }

  const onQuoteChange = event => {
    setNewQuote(event.target.value);
  };

  const onLogin = async event => {
    let transaction = createWallet(gnosisFactory, gnosisSafeMaster, selectedAddress);
    console.log(transaction);
    transaction.on("transactionHash", (hash) => {
      console.log("Transaction Hash", hash);
      showInfoMessage("Wallet creation transaction sent to blockchain");
    }).once("confirmation", async function(confirmationNumber, receipt) {
      console.log("Transaction confirmed", receipt);

      const localReceipt = await web3.eth.getTransactionReceipt(receipt.transactionHash);

      let localProxyAddress = hexStripZeros(localReceipt.logs[0].data);
      console.log('Proxy Address:', localProxyAddress);

      // Get the Proxy Address
      // TODO: If the first character of address is 0, there will be a problem

      if (localProxyAddress) {
        if(localProxyAddress.length < 42) {
          console(`Fixing trailing zeros in address ${localProxyAddress}`);
          localProxyAddress = fixTrailingZero(localProxyAddress);
          console.log(`Fixed address ${localProxyAddress}`)
        }
        setLocalStorage(PROXY_ADDRESS, localProxyAddress)
        setWalletAddress(localProxyAddress);
        proxyWallet = new web3.eth.Contract(
          config.gnosis.safeMasterCopy.abi,
          localProxyAddress
        );
        let data = {
          addresses: [localProxyAddress]
        }
        // Lets whitelist this address
        fetch("https://api.biconomy.io/api/v1/dapp/whitelist/proxy-contracts", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Authorization" : "User b99b1ecb-7d57-487f-a46d-d6aafef0be1a",
            'Content-Type': 'application/json;charset=utf-8'
          }
        }).then(response => {
          if(response.ok) {
            return response.json();
          } else {
            showErrorMessage("Whilelisting user proxy address failed");
          }
        }).then(response => {
          console.log(response);
          showSuccessMessage("User address whitelisted");
        });
        showSuccessMessage("Proxy Wallet created");
      } else {
        showErrorMessage("Login failed");
      }
    }).on("error", error => {
      console.log(error);
      showErrorMessage("Login failed");
    })
  }

  const fixTrailingZero = (address) => {
    let trailingZero = "";
    for(let index = 0; index < (42-address.length); index++) trailingZero += "0";
    return `${address.substring(0,2)}${trailingZero}${address.substring(2,address.length)}`;
  }

  const hexStripZeros = (value) => {
    if (!web3.utils.isHex(value)) {
        throw new Error('invalid hex string', { arg: 'value', value: value });
    }
    while (value.length > 3 && value.substring(0, 3) === '0x0') {
        value = '0x' + value.substring(3);
    }
    return value;
  }

  const onSubmit = async event => {
    if (newQuote != "" && contract) {
      const operation = 0; // CALL
      const gasPrice = 0; // If 0, then no refund to relayer
      const gasToken = '0x0000000000000000000000000000000000000000'; // ETH
      const executor = '0x0000000000000000000000000000000000000000';
      const to = config.contract.address;
      const valueWei = 0;
      const data = contract.methods.setQuote(newQuote).encodeABI();
      let txGasEstimate = 0;
      let baseGasEstimate = 0;

      let nonce = await getProxyContractNonce();
      const transactionHash = await proxyWallet.methods.getTransactionHash(
        to, valueWei, data, operation, txGasEstimate, baseGasEstimate, gasPrice, gasToken, executor, nonce).call();
        console.log(transactionHash)
        console.log(selectedAddress);

        console.log(web3.currentProvider)
        // let signature = await web3.eth.personal.sign(transactionHash, selectedAddress,"");
      var params = [transactionHash, selectedAddress]
      var method = 'personal_sign'
      web3.currentProvider.send({
        jsonrpc: "2.0",
        method,
        params,
        id: "9999999"
      }, function (err, result) {
        if (err) return console.error(err)
        if (result.error) return console.error(result.error)
        console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

        let signature = result.result
        const sig = getSignatureParameters(signature);
        const newSignature = `${sig.r}${sig.s.substring(2)}${Number(sig.v + 4).toString(16)}`;

        if(proxyWallet) {
          let trasnaction = proxyWallet.methods.execTransaction(to, valueWei, data, operation, txGasEstimate,
            baseGasEstimate, gasPrice, gasToken, executor, newSignature).send({from: selectedAddress});

          trasnaction.on("transactionHash", (hash) => {
              console.log("Transaction Hash", hash);
              showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
          }).once("confirmation", async function(confirmationNumber, receipt) {
              console.log("Transaction confirmed", receipt);
              showSuccessMessage("Transaction confirmed");
              getQuoteFromNetwork();
          }).on("error", error => {
              console.log(error);
          });

        } else {
          console.error("Proxy wallet is not initialized")
        }
      });



      // contract.methods
      //   .setQuote(newQuote)
      //   .send({ from: selectedAddress })
      //   .on("transactionHash", function(hash) {
      //     showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
      //   })
      //   .once("confirmation", function(confirmationNumber, receipt) {
      //     showSuccessMessage("Transaction confirmed");
      //     getQuoteFromNetwork();
      //   });
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const getProxyContractNonce = async function() {
    const nonce = await proxyWallet.methods.nonce().call();
    console.log('nonce.toNumber():', nonce);
    return nonce;
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
        let gasLimit = await contract.methods
          .executeMetaTransaction(userAddress, functionData, r, s, v)
          .estimateGas({ from: userAddress });
        let gasPrice = await web3.eth.getGasPrice();
        console.log(gasLimit);
        console.log(gasPrice);
        let tx = contract.methods
          .executeMetaTransaction(userAddress, functionData, r, s, v)
          .send({
            from: userAddress,
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit)
          });

        tx.on("transactionHash", function(hash) {
          console.log(`Transaction hash is ${hash}`);
          showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
        }).once("confirmation", function(confirmationNumber, receipt) {
          console.log(receipt);
          showSuccessMessage("Transaction confirmed on chain");
          getQuoteFromNetwork();
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
      { walletAddress &&
        <div className="wallet-info">
          <span>Wallet Address : </span>
          <span>{walletAddress}</span>
        </div>
      }
      <section>
        <div className="submit-container">
          { walletAddress &&
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
          }
          {!walletAddress &&
          <div className="login-row">
            <Button variant="outlined" color="primary" onClick={onLogin}>
              Login
            </Button>
          </div>
          }
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
