import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ethers } from "ethers";
import { Biconomy, PermitClient } from "@biconomy/mexa";
import { makeStyles, responsiveFontSizes } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");
const { config } = require("./config");
const EIP712_SIGN = "EIP712_SIGN";
const PERSONAL_SIGN = "PERSONAL_SIGN";

let usdcDomainData = {
  name : "USDC Coin",
  version : "1",
  chainId : 42,
  verifyingContract : config.usdcAddress
};

let ethersProvider, signer;
let biconomy;
let provider;
let contract, contractInterface, contractWithBasicSign;
let ercForwarderClient, permitClient;

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
        provider = window["ethereum"];
        await provider.enable();

        biconomy = new Biconomy(provider, {
            apiKey: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209",
            debug: true,
          });

        ethersProvider = new ethers.providers.Web3Provider(biconomy);
        signer = ethersProvider.getSigner();
        console.log(signer);

        biconomy
          .onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc

            //contract should have been registered on the dashboard as ERC20_FORWARDER
            contract = new ethers.Contract(
              config.contract.address,
              config.contract.abi,
              signer.connectUnchecked()
            );

            ercForwarderClient = biconomy.erc20ForwarderClient;
            permitClient = biconomy.permitClient;

            contractInterface = new ethers.utils.Interface(config.contract.abi);
            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            ethersProvider.on("accountsChanged", function (accounts) {
              setSelectedAddress(accounts[0]);
            });
          })
          .onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
            console.log(message);
            console.log(error);
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

  const onSubmitEIP712 = async (event) => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {

        let userAddress = selectedAddress;
        
        //If your provider is not a signer with accounts then you must pass userAddress in the permti options
        const usdcPermitOptions = {
          domainData: usdcDomainData,
          spender: config.feeProxyAddress,
          value: "100000000000000000000", 
          deadline: Math.floor(Date.now() / 1000 + 3600),
        }

        console.log("getting permit to spend usdc tokens");
        showInfoMessage(
          `Getting signature and permit transaction to spend usdc token by Fee proxy contract ${config.feeProxyAddress}`
        );
        
        //If you're not using biconomy's permit client as biconomy's member you can create your own without importing Biconomy.
        //Users need to pass provider object from window, spender address (erc20 forwarder OR the fee proxy address) and DAI's address for your network
        //permitClient = new PermitClient(provider,config.feeProxyAddress,config.daiAddress);

        //OR use biconomy's permitclient member as below!
        // If you'd like to see demo for spending DAI please check the branch erc20-forwarder-demo
        // If you'd like to see demo for spending USDT please check the branch erc20-metatx-api

        // This step only needs to be done once and is valid during the given deadline
        await permitClient.eip2612Permit(usdcPermitOptions);

        console.log("Sending meta transaction");
        showInfoMessage("Building transaction to forward");
        // txGas should be calculated and passed here or calculate within the method

        let { data } = await contract.populateTransaction.setQuote(newQuote);
        let gasPrice = await ethersProvider.getGasPrice();
        let gasLimit = await ethersProvider.estimateGas({
          to: config.contract.address,
          from: userAddress,
          data: data,
        });
        console.log(gasLimit.toString());
        console.log(gasPrice.toString());
        console.log(data);

        const builtTx = await ercForwarderClient.buildTx({
          to: config.contract.address,
          token:config.usdcAddress,
          txGas:Number(gasLimit),
          data
        });
        const tx = builtTx.request;
        const fee = builtTx.cost;
        console.log(tx);
        console.log(fee);
        showInfoMessage(`Signing message for meta transaction`);

        //signature of this method is sendTxEIP712({req, signature = null, userAddress})
        //signature param is optional. check network agnostics section for more details about this
        //userAddress is must when your provider does not have a signer with accounts 
        let transaction = await ercForwarderClient.sendTxEIP712({req:tx});
        //returns an object containing code, log, message, txHash 
        console.log(transaction);
      
        //event emitter methods
        ethersProvider.once(transaction.txHash, (result) => {
          // Emitted when the transaction has been mined
          console.log(result);
          setTransactionHash(transaction.txHash);
          getQuoteFromNetwork();
        });
      } else {
        console.log("Sending normal transaction");
        let tx = await contract.setQuote(newQuote);
        console.log("Transaction hash : ", tx.hash);
        showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
        let confirmation = await tx.wait();
        console.log(confirmation);
        setTransactionHash(tx.hash);

        showSuccessMessage("Transaction confirmed on chain");
        getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const onSendRawTxFromBackend = async (event) => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
       
        const usdcPermitOptions = {
          domainData: usdcDomainData,
          spender: config.feeProxyAddress,
          value: "100000000000000000000", 
          deadline: Math.floor(Date.now() / 1000 + 3600),
        }

        //For an example using DAI tokens check the method onSendRawTxFromBackend in the branch erc20-forwarder-demo 

        //This permit is only required once and remains valid according to the set deadline 
        await permitClient.eip2612Permit(usdcPermitOptions);

        let userAddress = selectedAddress;
        
        sendSignedRawTransaction(userAddress, newQuote);
      } else {
        console.log("Sending normal transaction");
        let tx = await contract.setQuote(newQuote);
        console.log("Transaction hash : ", tx.hash);
        showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
        let confirmation = await tx.wait();
        console.log(confirmation);
        setTransactionHash(tx.hash);

        showSuccessMessage("Transaction confirmed on chain");
        getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const onSubmitPersonalSign = async (event) => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
       
        let userAddress = selectedAddress;

        console.log("getting permit to spend usdc tokens");
        showInfoMessage(
          `Getting signature and permit transaction to spend usdc token by Fee proxy contract ${config.feeProxyAddress}`
        );

        const usdcPermitOptions = {
          domainData: usdcDomainData,
          spender: config.feeProxyAddress,
          value: "100000000000000000000", 
          deadline: Math.floor(Date.now() / 1000 + 3600),
        }

        //If already given permit skip below step
        //await permitClient.eip2612Permit(usdcPermitOptions);

        console.log("Sending meta transaction");
        showInfoMessage("Building transaction to forward");
        //txGas should be calculated and passed here or calculate within the method

        let { data } = await contract.populateTransaction.setQuote(newQuote);
        let gasPrice = await ethersProvider.getGasPrice();
        let gasLimit = await ethersProvider.estimateGas({
          to: config.contract.address,
          from: userAddress,
          data: data,
        });
        console.log(gasLimit.toString());
        console.log(gasPrice.toString());
        console.log(data);

        const builtTx = await ercForwarderClient.buildTx({
          to: config.contract.address,
          token:config.usdcAddress,
          txGas:Number(gasLimit),
          data
        });
        const tx = builtTx.request;
        const fee = builtTx.cost;

        console.log(tx);
        console.log(fee);

        showInfoMessage(`Signing message for meta transaction`);
        
        //signature of this method is sendTxEIP712({req, signature = null, userAddress})
        //signature param is optional. check network agnostics section for more details about this
        //userAddress is must when your provider does not have a signer with accounts 
        let txResponse = await ercForwarderClient.sendTxPersonalSign({req:tx});
        //returns an object containing code, log, message, txHash 
        const txHash = txResponse.txHash;
        console.log(txHash);
       

        //event emitter methods
        ethersProvider.once(txHash, (result) => {
            // Emitted when the transaction has been mined
            console.log(result);
            setTransactionHash(txHash);
            getQuoteFromNetwork();
          });
      } else {
        console.log("Sending normal transaction");
        let tx = await contract.setQuote(newQuote);
        console.log("Transaction hash : ", tx.hash);
        showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
        let confirmation = await tx.wait();
        console.log(confirmation);
        setTransactionHash(tx.hash);

        showSuccessMessage("Transaction confirmed on chain");
        getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const getQuoteFromNetwork = () => {
    if (ethersProvider && contract) {
      contract.getQuote().then(function (result) {
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

  // contract should be registered as erc20 forwarder
  // get user signature and send raw tx along with signature type
  const sendSignedRawTransaction = async (userAddress, arg) => {
    let privateKey =
      "cf7631b12222c3de341edc2031e01d0e65f664ddcec7aaa1685e303ca3570d44"; // process.env.privKey
    let wallet = new ethers.Wallet(privateKey);
    let functionSignature = contractInterface.encodeFunctionData("setQuote", [
      arg,
    ]);

    let gasPrice = await ethersProvider.getGasPrice();
    let gasLimit = await ethersProvider.estimateGas({
      to: config.contract.address,
      from: userAddress,
      data: functionSignature,
    });
    console.log(gasLimit.toString());
    console.log(gasPrice.toString());
    console.log(functionSignature);

    let rawTx, signedTx;

    rawTx = {
      to: config.contract.address,
      data: functionSignature,
      from: userAddress,
      value: "0x0",
      //gasLimit: web3.utils.toHex(gasLimit),
    };

    signedTx = await wallet.signTransaction(rawTx);
    console.log(signedTx);

    // should get user message to sign EIP712/personal for trusted and ERC forwarder approach
    const forwardRequestData = await biconomy.getForwardRequestAndMessageToSign(signedTx, config.usdcAddress);
    /*console.log(dataToSign);
    const signParams = dataToSign.eip712Format;
    //https://github.com/ethers-io/ethers.js/issues/687
    delete signParams.types.EIP712Domain;
    console.log(signParams);
    const signature = await wallet._signTypedData(
      signParams.domain,
      signParams.types,
      signParams.message
    );*/

    console.log(`${forwardRequestData.cost} amount of tokens will be charged`);

    //optional
    const signature = sigUtil.signTypedMessage(
      new Buffer.from(privateKey, "hex"),
      {
        data: forwardRequestData.eip712Format, // option to get personalFormat also 
      },
      "V4"
    );

    let data = {
      signature: signature,
      forwardRequest: forwardRequestData.request,
      rawTransaction: signedTx,
      signatureType: EIP712_SIGN,
    };

   /*const createReceipt = await ethersProvider.sendTransaction(signedTx); 
   // this is like send signed transaction, only works when you dont need extra parameters!
   await createReceipt.wait();
   console.log(`Transaction successful with hash: ${createReceipt.hash}`);*/

    let tx = await ethersProvider.send("eth_sendRawTransaction", [data]);

    console.log("Transaction hash : ", tx);
    showInfoMessage(`Transaction sent by relayer with hash ${tx}`);

    //event emitter methods
    ethersProvider.once(tx, (transaction) => {
      // Emitted when the transaction has been mined
      console.log(transaction);
      setTransactionHash(tx);
      getQuoteFromNetwork();
    });
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
        )}
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
            <Button
              variant="contained"
              color="primary"
              onClick={onSubmitEIP712}
            >
              Submit with EIP712
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onSubmitPersonalSign}
            >
              Submit with Personal
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onSendRawTxFromBackend}
            >
              send backend signed Tx
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;
