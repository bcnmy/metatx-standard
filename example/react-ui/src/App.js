import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import {toBuffer} from "ethereumjs-util";
import abi from "ethereumjs-abi";
import events from "events";
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
        biconomy = new Biconomy(provider,{apiKey: "SvLGfv-Tb.f53a653b-8a1e-4c0f-950f-fa6553efee43", debug: true});
        if (provider.networkVersion === "42") {
          web3 = new Web3(biconomy);

          biconomy.onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );
            setSelectedAddress(provider.selectedAddress);
            setTokenSymbol();
            setTokenDecimal();
            getTokenBalance(provider.selectedAddress);
          }).onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
          });


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

  const executeMetaTransaciton = async (userAddress, functionSignature, contract, contractAddress, chainId) => {
    var eventEmitter = new events.EventEmitter();
    if(contract && userAddress && functionSignature, chainId, contractAddress) {
      let nonce = await contract.methods.getNonce(userAddress).call();
      let messageToSign = constructMetaTransactionMessage(nonce, chainId, functionSignature, contractAddress);

      const signature = await web3.eth.personal.sign(
        "0x" + messageToSign.toString("hex"),
        userAddress
      );

      console.info(`User signature is ${signature}`);
      let { r, s, v } = getSignatureParameters(signature);

      console.log("before transaction listener");
      // No need to calculate gas limit or gas price here
      let transactionListener = contract.methods.executeMetaTransaction(userAddress, functionSignature, r, s, v).send({
          from: userAddress
      });

      transactionListener.on("transactionHash", (hash)=>{
        eventEmitter.emit("transactionHash", hash);
      }).once("confirmation", (confirmation, recipet) => {
        eventEmitter.emit("confirmation", confirmation, recipet);
      }).on("error", error => {
        eventEmitter.emit("error", error);
      });

      return eventEmitter;
    } else {
      console.log("All params userAddress, functionSignature, chainId, contract address and contract object are mandatory");
    }
  }

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
        let functionSignature = contract.methods.mint(userAddress, tokenToTransfer.toString()).encodeABI();

        let result = await executeMetaTransaciton(selectedAddress, functionSignature, contract, config.contract.address, "42");
        result.on("transactionHash", (hash)=>{
          setTransactionHash(hash);
          setTransactionState(PENDING);
        }).once("confirmation", (confirmation, recipet) => {
          setTransactionState(CONFIRMED);
          getTokenBalance(selectedAddress);
        }).on("error", (error)=>{
          console.log(error);
        })

      }
    } else {
      showErrorMessage("User account not initialized");
    }
  }

  const onTokenTransfer = async event => {
    if(selectedAddress) {
      let tokenToTransfer = tokenAmount;
      if(!recipientAddress) {
        return showErrorMessage("Please enter the recipient address");
      }
      if(!tokenToTransfer) {
        return showErrorMessage("Please enter tokens to transfer");
      }

      if(contract && decimal) {
        tokenToTransfer = tokenToTransfer*Math.pow(10, decimal);
        let functionSignature = contract.methods.transfer(recipientAddress, tokenToTransfer.toString()).encodeABI();

        let result = await executeMetaTransaciton(selectedAddress, functionSignature, contract, config.contract.address, "42");
        result.on("transactionHash", (hash)=>{
          setTransactionHash(hash);
          setTransactionState(PENDING);
        }).once("confirmation", (confirmation, recipet) => {
          setTransactionState(CONFIRMED);
          getTokenBalance(selectedAddress);
        }).on("error", (error)=>{
          console.log(error);
        })

      }
    } else {
      showErrorMessage("User account not initialized");
    }
  }

  const getTokenBalance = (userAddress) => {
    if(web3 && contract) {
      console.log("Getting token balance");
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
