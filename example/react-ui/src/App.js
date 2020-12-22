import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";
import { ethers } from "ethers";
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
import {
  helperAttributes,
  getDomainSeperator,
  getDataToSignForPersonalSign,
  getDataToSignForEIP712,
  buildForwardTxRequest,
  getBiconomyForwarder
} from './biconomyForwarderHelpers';
let sigUtil = require("eth-sig-util");
const { config } = require("./config");
const abi = require("ethereumjs-abi");


let web3;
let contract;
let provider;
//let biconomy;

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

//todo
//review for dev perspective more or less freedom
//review config
//get contract address map for network id
//seperation of ethers and web3 

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
          provider = window["ethereum"];
          await provider.enable();

          //biconomy = new Biconomy(provider,{apiKey: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209", debug: true});
          web3 = new Web3(provider);

            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );

            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function(accounts) {
              setSelectedAddress(accounts[0]);
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

  /* this app does not need to use @biconomy/mexa */
  /* for quotes dapp demo with erc20 forwarder and api call check the branch -  from repo - */
  const onForwardWithEIP712Signature = async event => {
    if (newQuote != "" && contract) {
      setTransactionHash("");

      /**
       * create an instance of BiconomyForwarder <= ABI, Address
       * create functionSignature
       * create txGas param which is gas estimation of his function call
       * get nonce from biconomyForwarder instance
       * create a forwarder request
       * create dataToSign as per signature scheme used (EIP712 or personal)
       * get the signature from user
       * create the domain separator
       * Now call the meta tx API
       */
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;

        let functionSignature = contract.methods.setQuote(newQuote).encodeABI();
        let txGas = await contract.methods.setQuote(newQuote).estimateGas({from: userAddress});

        //const batchId = await biconomyForwarder.methods.getBatch(userAddress).call();
        let forwarder = await getBiconomyForwarder(provider,42);
        const batchNonce = await forwarder.getNonce(userAddress,0);
        console.log(batchNonce);

        const req = await buildForwardTxRequest(userAddress,config.contract.address,Number(txGas),0,batchNonce,functionSignature);
        console.log(req);

        const domainSeparator = getDomainSeperator(helperAttributes.biconomyForwarderDomainData);
        console.log(domainSeparator);

        const dataToSign = getDataToSignForEIP712(req);

        const promi = new Promise(async function(resolve, reject) {
          await web3.currentProvider.send(
            {
              jsonrpc: "2.0",
              id: 999999999999,
              method: "eth_signTypedData_v4",
              params: [userAddress, dataToSign]
            }, function(error, res){
            if(error) {
              reject(error);
            } else {
              resolve(res.result);
            }
          });
        });

        promi.then(async function(sig){
          console.log('signature ' + sig);
          await sendTransaction({userAddress, req, domainSeparator, sig, signatureType:"EIP712_SIGN"});
        }).catch(function(error) {
          console.log('could not get signature error ' + error);
          showErrorMessage("Could not get user signature");
        });

      } else {
        showErrorMessage("Meta Transaction disabled");
      }
    } else {
      showErrorMessage("Error while sending");
    }
  };

  const onForwardWithPersonalSignature = async event => {
    if (newQuote != "" && contract) {
      setTransactionHash("");

      /**
       * create an instance of BiconomyForwarder <= ABI, Address
       * create functionSignature
       * create txGas param which is gas estimation of his function call
       * get nonce from biconomyForwarder instance
       * create a forwarder request
       * create dataToSign as per signature scheme used (EIP712 or personal)
       * get the signature from user
       * create the domain separator
       * Now call the meta tx API
       */
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;

        let functionSignature = contract.methods.setQuote(newQuote).encodeABI();
        let txGas = await contract.methods.setQuote(newQuote).estimateGas({from: userAddress});
    
        let forwarder = await getBiconomyForwarder(provider,42);
        //const batchId = await biconomyForwarder.methods.getBatch(userAddress).call();
        const batchNonce = await forwarder.getNonce(userAddress,0);
        console.log(batchNonce);

        const req = await buildForwardTxRequest(userAddress,config.contract.address,Number(txGas),0,batchNonce,functionSignature);
        console.log(req);

        const hashToSign =  getDataToSignForPersonalSign(req);

        const sig = await web3.eth.personal.sign("0x" + hashToSign.toString("hex"), userAddress);

        console.log('signature ' + sig);
        await sendTransaction({userAddress, req, sig, signatureType:"PERSONAL_SIGN"});

      } else {
        showErrorMessage("Meta Transaction disabled");
      }
    } else {
      showErrorMessage("Error while sending");
    }
  };

  const signMessage = async (addr, data) => {
    let signature;
    await web3.currentProvider.sendAsync(
      {
        jsonrpc: "2.0",
        id: 999999999999,
        method: "eth_signTypedData_v4",
        params: [addr, data]
      },
      function(error, response) {
        console.info(`User signature is ${response.result}`);
        if (error || (response && response.error)) {
          showErrorMessage("Could not get user signature");
        } else if (response && response.result) {
          signature = response.result;
          return signature;
        }
      }
    );
  }

  const sendTransaction = async ({userAddress, req, sig, domainSeparator, signatureType}) => {
    if (web3 && contract) {
      let params;
      if(domainSeparator) {
          params = [req, domainSeparator, sig]
      } else {
          params = [req, sig]
      }
      try {
        fetch(`https://localhost:4000/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key" : "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209",
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            "to": config.contract.address,
            "apiId": "aeecd3f0-b0da-449f-9a65-b8a16fe0cc9e",
            "params": params,
            "from": userAddress,
            // "gasLimit":1000000,
            "signatureType": signatureType
          })
        })
        .then(response=>response.json())
        .then(function(result) {
          console.log(result);
          showInfoMessage(`Transaction sent by relayer with hash ${result.txHash}`);
          // todo - fetch mined transaction receipt, show tx confirmed and update quotes
        })
	      .catch(function(error) {
	        console.log(error)
	      });
      } catch (error) {
        console.log(error);
      }
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
            <Link href={`https://kovan.etherscan.io/tx/${transactionHash}/internal_transactions`} target="_blank"
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
            <Button variant="contained" color="primary" onClick={onForwardWithEIP712Signature}>
              Submit with Biconomy Forwarder (EIP712 Sig)
            </Button>

            <Button variant="contained" color="primary" onClick={onForwardWithPersonalSignature}>
              Submit with Biconomy Forwarder (Personal Sig)
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
