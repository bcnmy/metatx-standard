import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";
import Biconomy from "@biconomy/mexa";
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");
const { config } = require("./config");

const domainType = [{
  name: "name",
  type: "string"
}, {
  name: "version",
  type: "string"
}, {
  name: "verifyingContract",
  type: "address"
}, {
  name: "salt",
  type: "bytes32"
}];
const metaTransactionType = [{ name: "nonce", type: "uint256" },{ name: "from", type: "address" },{ name: "functionSignature", type: "bytes" }];

const domainData = {
  name: "<>", 
  version: "1",
  verifyingContract: "<>",
  salt: '0x' + (80001).toString(16).padStart(64, '0')
};

let web3;
let contract;

const useStyles = makeStyles((theme) => ({
  root: {
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px"
  }
}));

function App() {
  const classes = useStyles();
  const preventDefault = (event) => event.preventDefault();
  const [quote, setQuote] = useState("This is a default quote");
  const [owner, setOwner] = useState("Default Owner Address");
  const [newQuote, setNewQuote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);
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
          if (provider.networkVersion == "80001") {
            domainData.chainId = 80001;
          web3 = new Web3(provider);

            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );
            setSelectedAddress(provider.selectedAddress);
            provider.on("accountsChanged", function(accounts) {
              setSelectedAddress(accounts[0]);
            });
        } else {
           showErrorMessage("Please change the network in metamask to Mumbai Testnet");
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
      setTransactionHash("");
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;
        let nonce = await contract.methods.getNonce(userAddress).call();
        let functionSignature = contract.methods.approve(userAddress,"10000000000000000000").encodeABI();
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
              sendTransaction(userAddress, functionSignature, r, s, v);
            }
          }
        );
      } else {
        console.log("Sending normal transaction");
        contract.methods
          .setQuote(newQuote)
          .send({ from: selectedAddress })
          .on("transactionHash", function(hash) {
            showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
          })
          .once("confirmation", function(confirmationNumber, receipt) {
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed");
          });
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
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

  const sendTransaction = async (userAddress, functionData, r, s, v) => {
    if (web3 && contract) {
        try {
            fetch(`https://api.biconomy.io/api/v2/meta-tx/native`, {
                method: "POST",
                headers: {
                  "x-api-key" : "qmmBqJJvr.e4e26f4d-1fa1-48c5-b38b-edb9bfa2d78e",
                  'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                  "to": config.contract.address,
                  "apiId": "822a7b42-89a5-4bc8-96c9-63d15e6d3ef2",
                  "params": [userAddress, functionData, r, s, v],
                  "from": userAddress
                })
              })
              .then(response=>response.json())
              .then(async function(result) {
                console.log(result);
                showInfoMessage(`Transaction sent by relayer with hash ${result.txHash}`);
      
                let receipt = await getTransactionReceiptMined(result.txHash, 2000);
                setTransactionHash(result.txHash);
                showSuccessMessage("Transaction confirmed on chain");
                // getQuoteFromNetwork();
              }).catch(function(error) {
                  console.log(error)
                });
        } catch (error) {
            console.log(error);
        }
    }
};
const getTransactionReceiptMined = (txHash, interval) => {
  const self = this;
  const transactionReceiptAsync = async function(resolve, reject) {
    var receipt = await web3.eth.getTransactionReceipt(txHash);
    if (receipt == null) {
        setTimeout(
            () => transactionReceiptAsync(resolve, reject),
            interval ? interval : 500);
    } else {
        resolve(receipt);
    }
  };

  if (typeof txHash === "string") {
      return new Promise(transactionReceiptAsync);
  } else {
      throw new Error("Invalid Type: " + txHash);
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
      <section>
        {transactionHash !== "" && <Box className={classes.root} mt={2} p={2}>
          <Typography>
            Check your transaction hash
            <Link href={`https://mumbai-explorer.matic.today/tx/${transactionHash}`} target="_blank"
            className={classes.link}>
              here
            </Link>
          </Typography>
        </Box>}
      </section>
      <section>
        <div className="submit-container">
          <div className="submit-row">
            
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Submit
            </Button>
            {/* <Button variant="contained" color="primary" onClick={onSubmitWithPrivateKey} style={{marginLeft: "10px"}}>
              Submit (using private key)
            </Button> */}
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
