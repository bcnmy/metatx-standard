import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";
import {Biconomy} from "@biconomy/mexa"; // have to update a fix so there is no breaking changes
import { makeStyles, responsiveFontSizes } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
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
  name: "TestContract",
  version: "1",
  chainId: 42,
  verifyingContract: config.contract.address
};

let daiDomainData = {
  name : "Dai Stablecoin",
  version : "1",
  chainId : 42,
  verifyingContract : "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
};

const feeProxyAddress = "0x1E13cbCb6B695D10B68b2f83D71F0D201504C598";
const transferHandlerAddress = "0x4AB0652B1049607F9E51E61144767d1C978950d0"; // todo // yet to make optional and handle in the client 
const tokenAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";

// todo
// make clients pass the chainId instead of feeProxyDomainData
let feeProxyDomainData = {
  name : "TEST",
  version : "1",
  chainId : 42,
  verifyingContract : "0xBFA21CD2F21a8E581E77942B2831B378d2378E69"
};


let web3;
let contract,daiContract;
let ercForwarderClient,permitClient;

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
          const biconomy = new Biconomy(provider,{apiKey: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209", debug: true});
          web3 = new Web3(biconomy);
          //web3 = new Web3(provider);
          console.log(web3);
          daiContract = new web3.eth.Contract(
            config.tokenAbi,
            tokenAddress
          );
           
          //contract should have been registered on the dashboard as erc20 fee proxy 
          contract = new web3.eth.Contract(
            config.contract.abi,
            config.contract.address
          );

          
          biconomy.onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            ercForwarderClient = biconomy.erc20ForwarderClient;
            permitClient = biconomy.permitClient;
            console.log(contract);
            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function(accounts) {
              setSelectedAddress(accounts[0]);
            });
          }).onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
          });
          
      
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
        
        let userAddress = selectedAddress;
        let functionSignature = contract.methods.setQuote(newQuote).encodeABI();
        console.log(functionSignature);
        console.log("getting permit to spend dai");
        showInfoMessage(`Getting signature and permit transaction to spend dai token by Fee proxy contract ${feeProxyAddress}`);
        await permitClient.daiPermit(feeProxyAddress,Math.floor(Date.now() / 1000 + 3600),true);
        console.log("Sending meta transaction");
        showInfoMessage("Building transaction to forward");
        //txGas should be calculated and passed here or calculate within the method

        let gasLimit = await contract.methods
        .setQuote(newQuote)
        .estimateGas({ from: userAddress });        

        const builtTx = await ercForwarderClient.buildTx(config.contract.address,tokenAddress,Number(gasLimit),functionSignature);
        const tx = builtTx.request;
        const fee = builtTx.cost;
        console.log(tx);
        console.log(fee);
        showInfoMessage(`Signing message for meta transaction`);
        const txHash = await ercForwarderClient.sendTxEIP712(tx);
        console.log(txHash);
        
        //sendSignedTransaction(userAddress, newQuote);
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

  const sendSignedTransaction = async (userAddress, arg) => {
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
            gasPrice:gasPrice,
            signatureType:"EIP712Sign"
          });

        tx.on("transactionHash", function(hash) {
          console.log(`Transaction hash is ${hash}`);
          showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
        }).once("confirmation", function(confirmationNumber, receipt) {
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
          )}
        </div>
      </section>
      <section>
        {transactionHash !== "" && <Box className={classes.root} mt={2} p={2}>
          <Typography>
            Check your transaction hash
            <Link href={`https://kovan.etherscan.io/tx/${transactionHash}`} target="_blank"
            className={classes.link}>
              here
            </Link>
          </Typography>
        </Box>}
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
