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
const PENDING = "pending";
const CONFIRMED = "confirmed";

let web3;
let contract;
let biconomy;

function App() {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimal, setDecimal] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState("0x837DEb7B906fbcE871E80CF833f76f8562f598B3");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [transactionState, setTransactionState] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

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
          web3 = new Web3(biconomy);

          contract = new web3.eth.Contract(
            config.contract.abi,
            config.contract.address
          );
          setSelectedAddress(provider.selectedAddress);
          setTokenSymbol();
          setTokenDecimal();
          getTokenBalance(provider.selectedAddress);

          provider.on("accountsChanged", function(accounts) {
            setSelectedAddress(accounts[0]);
            getTokenBalance(accounts[0]);
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

  const setTokenDecimal = async () => {
    if(contract) {
      let decimal = await contract.methods.decimals().call();
      if(decimal) {
        setDecimal(decimal);
      } else {
        console.error("Unable to get token decimals");
      }
    } else {
      console.error("Contract is not initialised");
    }
  }

  const setTokenSymbol = async () => {
    if(contract) {
      let symbol = await contract.methods.symbol().call();
      if(symbol) {
        setSymbol(symbol);
      } else {
        console.error("Unable to get token symbol");
      }
    } else {
      console.error("Contract is not initialised");
    }
  }

  const onTokenChange = event => {
    setTokenAmount(event.target.value);
    setTransactionState("");
    setTransactionHash("");
  };

  const onRecipientChange = event => {
    setRecipientAddress(event.target.value);
    setTransactionState("");
    setTransactionHash("");
  }


  const onTokenMint = async event => {
    if(selectedAddress) {
      let userAddress = recipientAddress;
      let tokenToTransfer = tokenAmount;
      if(!userAddress) {
        return showErrorMessage("Please enter the recipient address");
      }
      if(!tokenToTransfer) {
        return showErrorMessage("Please enter tokens to transfer");
      }

      if(contract && decimal) {
        tokenToTransfer = tokenToTransfer*Math.pow(10, decimal);
        let result = contract.methods.mint(userAddress, tokenToTransfer.toString()).send({
          from: selectedAddress
        });

        result.on("transactionHash", (hash)=>{
          setTransactionHash(hash);
          setTransactionState(PENDING);
        }).once("confirmation", (confirmation, recipet) => {
          setTransactionState(CONFIRMED);
          getTokenBalance(selectedAddress);
        })

      }
    } else {
      showErrorMessage("User account not initialized");
    }
  }

  const onTokenTransfer = async event => {
    if(selectedAddress) {
      let userAddress = recipientAddress;
      let tokenToTransfer = tokenAmount;
      if(!userAddress) {
        return showErrorMessage("Please enter the recipient address");
      }
      if(!tokenToTransfer) {
        return showErrorMessage("Please enter tokens to transfer");
      }

      if(contract && decimal) {
        tokenToTransfer = tokenToTransfer*Math.pow(10, decimal);
        let result = contract.methods.transfer(userAddress, tokenToTransfer.toString()).send({
          from: selectedAddress
        });

        result.on("transactionHash", (hash)=>{
          setTransactionHash(hash);
          setTransactionState(PENDING);
          showInfoMessage(`Transaction sent successfully`);
        }).once("confirmation", (confirmation, recipet) => {
          setTransactionState(CONFIRMED);
          showInfoMessage(`Transaction Confirmed.`);
          getTokenBalance(selectedAddress);
        })

      }
    } else {
      showErrorMessage("User account not initialized");
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
        {transactionHash && transactionState === PENDING &&
          <div className="pending_tx status">Transaction sent with hash <a target="_blank" href={`https://kovan.etherscan.io/tx/${transactionHash}`}>{transactionHash}</a></div>
        }

        {transactionHash && transactionState === CONFIRMED &&
          <div className="confirmed_tx status">Transaction confirmed with hash <a target="_blank" href={`https://kovan.etherscan.io/tx/${transactionHash}`}>{transactionHash}</a></div>
        }

      </section>
      <section>
        <div className="token-row">
          <span>Token Balance : </span> {tokenBalance} {symbol}
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

          <Button className="action_button" variant="contained" color="primary" onClick={onTokenMint}>
            Mint
          </Button>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
