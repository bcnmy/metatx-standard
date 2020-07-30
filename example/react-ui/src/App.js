import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Biconomy from "@biconomy/mexa";
import { Magic } from 'magic-sdk';
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
  name: "ERC1155",
  version: "1",
  chainId: 3,
  verifyingContract: config.contract.address
};

let web3;
let contract;

function App() {
  const [selectedAddress, setSelectedAddress] = useState("");
  useEffect(() => {
    async function init() {
      console.log("start magic")
      const magic = new Magic("<MAGIC_KEY>", {
        network: "ropsten"
      });
      console.log(`start magic done ${magic}`);

    console.log(`Initialise Biconomy`)
    const biconomy = new Biconomy(magic.rpcProvider, {
      apiKey: "mbuXCxAWd.7d43ddeb-ee04-42a0-85ac-350ae193d607",
      debug:true
    });
    console.log(`Initialised Biconomy`);
    web3 = new Web3(biconomy);

    biconomy
      .onEvent(biconomy.READY, async() => {
        // Initialize your dapp here like getting user accounts etc
        contract = new web3.eth.Contract(
          config.contract.abi,
          config.contract.address
        );

        const isLoggedIn = await magic.user.isLoggedIn();
          if (isLoggedIn) { 
            console.log("User is logged in")
            const userMetadata = await magic.user.getMetadata();
            console.log("userMetadata.issuer: ", userMetadata.issuer)
            console.log("userMetadata.email: ", userMetadata.email)
            console.log("userMetadata.publicAddress: ", userMetadata.publicAddress)
            setSelectedAddress(userMetadata.publicAddress);
          }
          else{
            console.log("not able to find the user address")
          }
      })
      .onEvent(biconomy.ERROR, (error, message) => {
        // Handle error while initializing mexa
      });
    }
    init();
  }, []);

  const onSubmit = async event => {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;
        let nonce = await contract.methods.getNonce(userAddress).call();
        let functionSignature = contract.methods.mint("0xf86b30c63e068dbb6bddea6fe76bf92f194dc53c",2,12,"0x0").encodeABI();
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
              console.log(userAddress);
              console.log(JSON.stringify(message));
              console.log(message);
              console.log(getSignatureParameters(response.result));

              const recovered = sigUtil.recoverTypedSignature_v4({
                data: JSON.parse(dataToSign),
                sig: response.result
              });
              console.log(`Recovered ${recovered}`);
              sendSignedTransaction(userAddress, functionSignature, r, s, v);
            }
          }
        );
  };

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

  const showErrorMessage = message => {
    NotificationManager.error(message, "Error", 5000);
  };

  const showSuccessMessage = message => {
    NotificationManager.success(message, "Message", 3000);
  };

  const showInfoMessage = message => {
    NotificationManager.info(message, "Info", 3000);
  };

  const sendSignedTransaction = async (userAddress, functionData, r, s, v) => {
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
            gasPrice:gasPrice,
            gasLimit:gasLimit
          });

        tx.on("transactionHash", function(hash) {
          console.log(`Transaction hash is ${hash}`);
          showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
        }).once("confirmation", function(confirmationNumber, receipt) {
          console.log(receipt);
          showSuccessMessage("Transaction confirmed on chain");
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="App">
      <section>
        <div className="submit-container">
          <div className="submit-row">
            
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Mint
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
