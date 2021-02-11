import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";

import {Biconomy} from "@biconomy/mexa"; // have to update a fix so there is no breaking changes
import {makeStyles} from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import {Box} from "@material-ui/core";
let sigUtil = require("eth-sig-util");
const { config } = require("./config");


const domainType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "chainId",
    type: "uint256",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
];

const metaTransactionType = [
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "from",
    type: "address",
  },
  {
    name: "functionSignature",
    type: "bytes",
  },
];


let domainData = {
  name: "TestContract",
  version: "1",
  chainId: 42,
  verifyingContract: config.contract.address,
};

let web3;
let contract;
let biconomy;

const useStyles = makeStyles((theme) => ({
  root: {
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px",
  },
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

        biconomy = new Biconomy(provider, {
          apiKey: "ivDpoR7cT.b00a1b2a-e42f-4cce-8202-dc0dac68fc1b",
          debug: true,
        });

        web3 = new Web3(biconomy);

        biconomy
          .onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );
            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function (accounts) {
              setSelectedAddress(accounts[0]);
            });
          })
          .onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
          });
      } else {
        showErrorMessage("Metamask not installed");
      }
    }
    init();
  }, []);

  const onQuoteChange = (event) => {
    setNewQuote(event.target.value);
  };

  const onSubmit = async (event) => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;
        // let functionSignature = contract.methods.setQuote(newQuote).encodeABI();
        sendTransaction(userAddress, newQuote);
      } else {
        console.log("Sending normal transaction");
        contract.methods
          .setQuote(newQuote)
          .send({ from: selectedAddress })
          .on("transactionHash", function (hash) {
            showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
          })
          .once("confirmation", function (confirmationNumber, receipt) {
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed");
            getQuoteFromNetwork();
          });
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const onSendSignedTx = async (event) => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;
        //let functionSignature = contract.methods.setQuote(newQuote).encodeABI();
        sendSignedRawTransaction(userAddress, newQuote);
      } else {
        console.log("Sending normal transaction");
        contract.methods
          .setQuote(newQuote)
          .send({ from: selectedAddress })
          .on("transactionHash", function (hash) {
            showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
          })
          .once("confirmation", function (confirmationNumber, receipt) {
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed");
            getQuoteFromNetwork();
          });
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const getQuoteFromNetwork = () => {
    if (web3 && contract) {
      contract.methods
        .getQuote()
        .call()
        .then(function (result) {
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

  const showErrorMessage = (message) => {
    NotificationManager.error(message, "Error", 5000);
  };

  const showSuccessMessage = (message) => {
    NotificationManager.success(message, "Message", 3000);
  };

  const showInfoMessage = (message) => {
    NotificationManager.info(message, "Info", 3000);
  };

  // contract should be registered as trusted forwarder
  // get user signature and send raw tx along with signature type
  const sendSignedRawTransaction = async (userAddress, arg) => {
    let privateKey =
      "a0d8fface04545793ef670d0aa6c78a3cdb935a4bb5d55f3061f7558e51b4570"; // or process.env.privKey
    let functionSignature = contract.methods.setQuote(newQuote).encodeABI();
    let gasLimit = await contract.methods
      .setQuote(arg)
      .estimateGas({ from: userAddress });
    let txParams = {
      from: userAddress,
      gasLimit: web3.utils.toHex(gasLimit),
      to: config.contract.address,
      value: "0x0",
      data: functionSignature,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      txParams,
      `0x${privateKey}`
    );
    console.log(signedTx.rawTransaction);

    // should get user message to sign EIP712/personal for trusted and ERC forwarder approach
    const dataToSign = await biconomy.getForwardRequestAndMessageToSign(
      signedTx.rawTransaction
    );
    const signature = sigUtil.signTypedMessage(
      new Buffer.from(privateKey, "hex"),
      {
        data: dataToSign.eip712Format, // option to get personalFormat also 
      },
      "V4"
    );

    let rawTransaction = signedTx.rawTransaction;

    let data = {
      forwardRequest: dataToSign.request,
      signature: signature,
      rawTransaction: rawTransaction,
      signatureType: "EIP712_SIGN",
    };

    // Use any one of the methods below to check for transaction confirmation
    // USING PROMISE
    /*let receipt = await web3.eth.sendSignedTransaction(data, (error, txHash) => {
            if (error) {
                return console.error(error);
            }
            console.log(txHash);
        })*/

    // USING event emitter    
    let tx = web3.eth.sendSignedTransaction(data);

    tx.on("transactionHash", function (hash) {
      console.log(`Transaction hash is ${hash}`);
      showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
    }).once("confirmation", function (confirmationNumber, receipt) {
      console.log(receipt);
      setTransactionHash(receipt.transactionHash);
      showSuccessMessage("Transaction confirmed on chain");
      getQuoteFromNetwork();
    });
  };

  const sendTransaction = async (userAddress, arg) => {
    if (web3 && contract) {
      try {
        let gasLimit = await contract.methods
          .setQuote(arg)
          .estimateGas({ from: userAddress });
        let gasPrice = await web3.eth.getGasPrice();
        console.log(gasLimit);
        console.log(gasPrice);
        let tx = contract.methods
          .setQuote(arg)
          .send({
            from: userAddress,
            gasPrice: gasPrice,
            signatureType: "EIP712_SIGN",
            gasLimit: 300000
          });

        tx.on("transactionHash", function (hash) {
          console.log(`Transaction hash is ${hash}`);
          showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
        }).once("confirmation", function (confirmationNumber, receipt) {
          console.log(receipt);
          setTransactionHash(receipt.transactionHash);
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
          )}{" "}
        </div>
      </section>
      <section>
        {" "}
        {transactionHash !== "" && (
          <Box className={classes.root} mt={2} p={2}>
            <Typography>
              Check your transaction hash
              <Link
                href={`https://kovan.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                className={classes.link}
              >
                here
              </Link>
            </Typography>
          </Box>
        )}{" "}
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
            <Button variant="contained" color="primary" onClick={onSendSignedTx}>
              SendSignedTx from backend
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
