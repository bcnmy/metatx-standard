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

const permitType = [
  { name: "holder", type: "address" },
  { name: "spender", type: "address" },
  { name: "nonce", type: "uint256" },
  { name: "expiry", type: "uint256" },
  { name: "allowed", type: "bool" }
];

const erc20ForwardRequestType = [
  {name:'from',type:'address'},
  {name:'to',type:'address'},
  {name:'token',type:'address'},
  {name:'txGas',type:'uint256'},
  {name:'tokenGasPrice',type:'uint256'},
  {name:'batchId',type:'uint256'},
  {name:'batchNonce',type:'uint256'},
  {name:'deadline',type:'uint256'},
  {name:'data',type:'bytes'}
];

let domainData = {
  name: "TestContract",
  version: "1",
  chainId: "42",
  verifyingContract: config.contract.address
};

let daiDomainData = {
  name : "Dai Stablecoin",
  version : "1",
  chainId : 42,
  verifyingContract : "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"
};

let feeProxyDomainData = {
  name : "TEST",
  version : "1",
  chainId : 42,
  verifyingContract : "0x656a7B1B1E4525dB80bca5e80F4777F4b0C599b7"
};

let biconomyForwarderDomainData = {
  name : "TEST",
  version : "1",
  chainId : 42,
  verifyingContract : config.biconomyForwarderAddress
};


let web3;
let contract;
let biconomyForwarder;
let ercFeeProxy;

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

          //const biconomy = new Biconomy(provider,{apiKey: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209", debug: true});
          web3 = new Web3(provider);

            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );

            biconomyForwarder = new web3.eth.Contract(
              config.biconomyForwarderAbi,
              config.biconomyForwarderAddress
            );

            ercFeeProxy = new web3.eth.Contract(
              config.feeProxyAbi,
              config.feeProxyAddress
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
  const onForward = async event => {
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
        let message = {};

        //const batchId = await biconomyForwarder.methods.getBatch(userAddress).call();
        const batchNonce = await biconomyForwarder.methods.getNonce(userAddress,0).call();
        console.log(batchNonce);
        const req = {
         from : userAddress,
         to : config.contract.address,
         token : config.ZERO_ADDRESS,
         txGas : Number(txGas),
         tokenGasPrice : "0",
         batchId : 0,
         batchNonce : parseInt(batchNonce),
         deadline : Math.floor((Date.now()/1000)+3600),
         data : functionSignature
        };

        console.log(req);

        const domainSeparator = ethers.utils.keccak256((ethers.utils.defaultAbiCoder).
				encode(['bytes32','bytes32','bytes32','uint256','address'],
				[ethers.utils.id("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
		        ethers.utils.id(biconomyForwarderDomainData.name),ethers.utils.id(biconomyForwarderDomainData.version),
        biconomyForwarderDomainData.chainId,biconomyForwarderDomainData.verifyingContract]));

        console.log(domainSeparator);

        const dataToSign = JSON.stringify({
            types: {
                EIP712Domain: domainType,
                ERC20ForwardRequest: erc20ForwardRequestType
            },
            domain: biconomyForwarderDomainData,
            primaryType: "ERC20ForwardRequest",
            message: req
        });

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

        promi.then(function(sig){
          console.log('signature ' + sig);
          sendTransaction(userAddress, req, domainSeparator, sig);
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

  const sendTransaction = async (userAddress, req, domainSeparator, sig) => {
    if (web3 && contract) {
      try {
        fetch(`https://localhost:80/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key" : "bF4ixrvcS.7cc0c280-94cb-463f-b6bb-38d29cc9dfd2",
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            "to": config.contract.address,
            "apiId": "d1975758-fbf7-4f6d-96b4-2daff372f2b3",
            "params": [
              req, domainSeparator, sig
            ],
            "from": userAddress,
            // "gasLimit":1000000,
            "signatureType":"EIP712Sign"
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
            <Button variant="contained" color="primary" onClick={onForward}>
              Submit with Biconomy Forwarder
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
