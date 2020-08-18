import React, { useState, useEffect } from "react";
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
// import erc20 from './erc20.js';
const { config } = require("./config");
// import safe from './safe.js';

let web3;
let erc20Contract, proxyWallet;
const PROXY_ADDRESS = "0xaDa343Cb6820F4f5001749892f6CAA9920129F2A";

function App() {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    async function init() {
    //   const erc20Abi = JSON.parse(erc20);
    //   const safeAbi = JSON.parse(safe);
      if(
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        // Ethereum user detected. You can now use the provider.
        const provider = window["ethereum"];
        await provider.enable();
        if(provider.networkVersion === "4") {
          web3 = new Web3(provider);
            // Initialize your dapp here like getting user accounts etc
            erc20Contract = new web3.eth.Contract(
                config.contract.abi,
                config.contract.address
            );
            let proxyAddress = PROXY_ADDRESS;
            if(proxyAddress) {
              proxyWallet = new web3.eth.Contract(
                config.gnosis.safeMasterCopy.abi,
                proxyAddress
              );
              setWalletAddress(proxyAddress);
            }
            
            setSelectedAddress(provider.selectedAddress);
            provider.on("accountsChanged", function (accounts) {
              setSelectedAddress(accounts[0]);
            });

            // Whiltelist our DApp smart contract
            let data = {
              destinationAddresses: [
                '0x8C5baa9F30e317d882f18e7021eeFf858ef6A948'.toLowerCase()
              ]
            }
            fetch("https://api.biconomy.io/api/v1/dapp/whitelist/destination", {
              method: "POST",
              body: JSON.stringify(data),
              headers: {
                "Authorization": "User b8d74314-f72e-49cc-aba2-280e86089e08",
                'Content-Type': 'application/json;charset=utf-8'
              }
            }).then(response => {
              if(response.ok) {
                return response.json();
              } else {
                console.log("Whilelisting contract address failed");
              }
            }).then(response => {
              console.log(response);
              console.log("Dapp whitelisted successfully");
            });

        } else {
          console.log("Please change the network in metamask to Kovan");
        }
      } else {
        console.log("Metamask not installed");
      }
    }
    init();
  }, []);

  const onSubmit = async event => {
    // if(erc20Contract) {
      const operation = 0; // CALL
      const gasPrice = 0; // If 0, then no refund to relayer
      const gasToken = '0x0000000000000000000000000000000000000000'; // ETH
      const executor = '0x0000000000000000000000000000000000000000';
      const to = '0x8C5baa9F30e317d882f18e7021eeFf858ef6A948';
      const valueWei = 0;
      const data = erc20Contract.methods.approve('0xE02a8Dc9FE1Ed81054F7eA61a75cD651153edA21', 500).encodeABI();
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
        if(err) return console.error(err)
        if(result.error) return console.error(result.error)
        console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

        let signature = result.result
        const sig = getSignatureParameters(signature);
        const newSignature = `${sig.r}${sig.s.substring(2)}${Number(sig.v + 4).toString(16)}`;

        if(proxyWallet) {
            try {
                fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
                  method: "POST",
                  headers: {
                    "x-api-key" : "xLqd3k_kl.2e36e464-b8cc-4e19-9989-d3e571e1860c",
                    'Content-Type': 'application/json;charset=utf-8'
                  },
                  body: JSON.stringify({
                    "to": PROXY_ADDRESS,
                    "apiId": "ac92a90c-d46e-4344-9487-f518e7612b42",
                    "params": [
                        to, valueWei, data, operation, txGasEstimate,
                        baseGasEstimate, gasPrice, gasToken, executor, newSignature
                    ],
                    "from": selectedAddress
                    
                  })
                })
                .then(response=>response.json())
                .then(function(result) {
                  console.log(result);
                })
                  .catch(function(error) {
                    console.log(error)
                  });
              } catch (error) {
                console.log(error);
              }
        } else {
          console.error("Proxy wallet is not initialized")
        }
      });
  };

  const getSignatureParameters = signature => {
    if(!web3.utils.isHexStrict(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = web3.utils.hexToNumber(v);
    if(![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v
    };
  };

  const getProxyContractNonce = async function () {
    const nonce = await proxyWallet.methods.nonce().call();
    console.log('nonce.toNumber():', nonce);
    return nonce;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button type="button" onClick={() => { onSubmit(); }}>
            Hi
        </button>
         { walletAddress &&
        <div className="wallet-info">
          <span>Wallet Address : </span>
          <span>{walletAddress}</span>
        </div>
      }
      </header>
    </div>
  );
};

export default App;