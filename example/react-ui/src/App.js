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

const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" }
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" }
];

let domainData = {
  name: "AletheaToken",
  version: "1",
  verifyingContract: config.contract.address
};

let web3;
let contract;
let biconomy;

function App() {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        // Ethereum user detected. You can now use the provider.
        const provider = window["ethereum"];
        await provider.enable();
        biconomy = new Biconomy(provider,{apiKey: "rvMCFPRfp.9e0d1764-6da2-484f-8ddf-08f70b67124d"});
        if (provider.networkVersion === "42") {
          domainData.chainId = 42;
          web3 = new Web3(biconomy);

          contract = new web3.eth.Contract(
            config.contract.abi,
            config.contract.address
          );
          setSelectedAddress(provider.selectedAddress);
          getTokenBalance(provider.selectedAddress);
          provider.on("accountsChanged", function(accounts) {
            setSelectedAddress(accounts[0]);
            getTokenBalance(accounts[0]);
          });
        } else {
          showErrorMessage("Please change the network in metamask to Ropsten");
        }
      } else {
        showErrorMessage("Metamask not installed");
      }
    }
    init();
  }, []);

  const onTokenChange = event => {
    setTokenAmount(event.target.value);
  };
  const onRecipientChange = event => {
    setRecipientAddress(event.target.value);
  }

  const onTokenTransfer = async event => {
    if(recipientAddress && tokenAmount) {
      let userAddress = selectedAddress;
      let nonce = await contract.methods.getNonce(userAddress).call();
      let functionSignature = contract.methods.transfer(recipientAddress, (tokenAmount*1e18).toString()).encodeABI();
      let message = {};
      message.nonce = parseInt(nonce);
      message.from = userAddress;
      message.functionSignature = functionSignature;

      const dataToSign = JSON.stringify({
        types: {
          EIP712Domain: domainType,
          MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
      });
      console.log(domainData);
      console.log();
      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          id: 999999999999,
          method: "eth_signTypedData_v4",
          params: [userAddress, dataToSign]
        },
        function(error, response) {
          console.info(`User signature is ${response.result}`);
          if (error || (response && response.error)) {
            showErrorMessage("Could not get user signature");
          } else if (response && response.result) {
            let { r, s, v } = getSignatureParameters(response.result);
            const recovered = sigUtil.recoverTypedSignature_v4({
              data: JSON.parse(dataToSign),
              sig: response.result
            });
            console.log(`Recovered ${recovered}`);
            sendTransaction(userAddress, functionSignature, r, s, v);
          }
        }
      );
    }
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

  const getTokenBalance = (userAddress) => {
    if(web3 && contract) {
      contract.methods
        .balanceOf(userAddress)
        .call()
        .then(function(result) {
          if (result) {
            setTokenBalance(result/1e18);
          } else {
            showErrorMessage("Not able to get token balance from Network");
          }
        });
    }
  }

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
            from: userAddress
          });

        tx.on("transactionHash", function(hash) {
          console.log(`Transaction hash is ${hash}`);
          showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
        }).once("confirmation", function(confirmationNumber, receipt) {
          console.log(receipt);
          showSuccessMessage("Transaction confirmed on chain");
          getTokenBalance(selectedAddress);
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="App">
      <section>
        <div className="token-row">
          <span>Token Balance : </span> {tokenBalance} ALTH
        </div>
      </section>
      <section>
        <div className="token-row token-input-row">
            <input type="number" placeholder="Enter amount of tokens" onChange={onTokenChange} value={tokenAmount} />
            <input type="text" placeholder="Enter recipient address" onChange={onRecipientChange} value={recipientAddress} />
        </div>
        <div className="token-row">
          <Button variant="contained" color="primary" onClick={onTokenTransfer}>
            Transfer
          </Button>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
