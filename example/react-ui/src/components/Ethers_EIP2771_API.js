import React, { useState, useEffect } from "react";
import "../App.css";
import Button from "@material-ui/core/Button";
import {
  helperAttributes,
  getDomainSeperator,
  getDataToSignForPersonalSign,
  getDataToSignForEIP712,
  buildForwardTxRequest,
  getBiconomyForwarderConfig
} from '../api-helpers/biconomyForwarderHelpers';
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ethers } from "ethers";
import { Biconomy } from "@biconomy/mexa";

import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");


let config = {
  contract: {
    // address: "0x379A64a30B9Da67A6E0c2957bA23a3eC4a666fE7",
    address: "0x64742C1acC255CfcA1dE078e1E2b852A1308912B",
      abi: [ { "inputs": [], "name": "spin", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "contract ERC2771Forwarder", "name": "forwarder", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "spinner", "type": "address" } ], "name": "WheelSpinEvent", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "name": "isTrustedForwarder", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "trustedForwarder", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" } ]
  },
  apiKey: {
    test: "k_POEMBl7.cd8fa918-1af6-430a-a095-8929de7081a7",
    prod: "p4MMyUygT.e13c5954-4530-4429-b502-c6ac4db13f6c"
  },
  api: {
    test: "https://test-api.biconomy.io",
    prod: "https://api.biconomy.io"
  }
}

let ethersProvider, walletProvider, walletSigner;
let contract, contractInterface;

const useStyles = makeStyles((theme) => ({
  root: {
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px"
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
    opacity: '.85!important',
    background: '#000'
  },
}));

let biconomy, userAddress;

function App() {
  const classes = useStyles();
  const [backdropOpen, setBackdropOpen] = React.useState(true);
  const [loadingMessage, setLoadingMessage] = React.useState(" Loading Application ...");
  const [quote, setQuote] = useState("This is a default quote");
  const [owner, setOwner] = useState("Default Owner Address");
  const [newQuote, setNewQuote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [metaTxEnabled] = useState(true);
  const [transactionHash, setTransactionHash] = useState("");

  const handleClose = () => {
    setBackdropOpen(false);
  };



  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        // Ethereum user detected. You can now use the provider.
        const provider = window["ethereum"];
        await provider.enable();
        setLoadingMessage("Initializing Biconomy ...");
        // We're creating biconomy provider linked to your network of choice where your contract is deployed
        let jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/mantle/07101210d8974c619d563526229a15fdc1675bb1e862ed04a6b8c4e90fa45fab");
        biconomy = new Biconomy(jsonRpcProvider, {
          walletProvider: window.ethereum,
          apiKey: config.apiKey.prod,
          debug: true
        });

        /*
          This provider is linked to your wallet.
          If needed, substitute your wallet solution in place of window.ethereum 
        */
        ethersProvider = new ethers.providers.Web3Provider(biconomy);
        walletProvider = new ethers.providers.Web3Provider(window.ethereum);
        walletSigner = walletProvider.getSigner();

        userAddress = await walletSigner.getAddress()
        setSelectedAddress(userAddress);

        biconomy.onEvent(biconomy.READY, async () => {

          console.log("Biconomy ready");
          // Initialize your dapp here like getting user accounts etc
          contract = new ethers.Contract(
            config.contract.address,
            config.contract.abi,
            biconomy.getSignerByAddress(userAddress)
          );

          contractInterface = new ethers.utils.Interface(config.contract.abi);
          console.log(" contract ready");
          handleClose();
          // getQuoteFromNetwork();
        }).onEvent(biconomy.ERROR, (error, message) => {
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

  const onQuoteChange = event => {
    setNewQuote(event.target.value);
  };

  const onSubmitWithEIP712Sign = async () => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
        console.log("Sending meta transaction");

        let userAddress = selectedAddress;
        console.log(userAddress);

        const feeData = await ethersProvider.getFeeData();
        console.log(`maxFeePerGas: ${feeData.maxFeePerGas}`);
        console.log(`maxPriorityFeePerGas: ${feeData.maxPriorityFeePerGas}`);

        let { data } = await contract.populateTransaction.spin();
        console.log(data);
        let gasPrice = await ethersProvider.getGasPrice();
        console.log(gasPrice.toString());
        let gasLimit = await ethersProvider.estimateGas({
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          to: config.contract.address,
          from: userAddress,
          data: data,
        });
        console.log(gasLimit.toString());
        console.log(gasPrice.toString());

        let forwarder = await getBiconomyForwarderConfig(5000);
        let forwarderContract = new ethers.Contract(
          forwarder.address,
          forwarder.abi,
          biconomy.getSignerByAddress(userAddress)
        );

        const batchNonce = await forwarderContract.getNonce(userAddress, 0);
        // const batchId = await forwarderContract.getBatch(userAddress);

        console.log("batchNonce: ",batchNonce);
        const to = config.contract.address;
        // const gasLimitNum = Number(gasLimit.toNumber().toString());
        // console.log(gasLimitNum);
        // const batchId = 0;
        const req = await buildForwardTxRequest({
          account: userAddress,
          to,
          gasLimitNum: 91969396,
          batchId:0,
          batchNonce,
          data,
        });
        
        console.log(req);

        const domainSeparator = await getDomainSeperator(5000);
        console.log(domainSeparator);

        const dataToSign = await getDataToSignForEIP712(req, 5000);
        walletProvider
          .send("eth_signTypedData_v3", [userAddress, dataToSign])
          .then(function (sig) {
            sendTransaction({
              userAddress,
              request: req,
              domainSeparator,
              sig,
              signatureType: "EIP712_SIGN",
            });
          })
          .catch(function (error) {
            console.log(error);
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
        // getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const onSubmitWithPersonalSign = async () => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;

        let { data } = await contract.populateTransaction.setQuote(newQuote);
        let gasPrice = await ethersProvider.getGasPrice();
        let gasLimit = await ethersProvider.estimateGas({
          to: config.contract.address,
          from: userAddress,
          data: data,
        });
        console.log(gasLimit.toString());
        console.log(gasPrice.toString());

        let forwarder = await getBiconomyForwarderConfig(42);
        let forwarderContract = new ethers.Contract(
          forwarder.address,
          forwarder.abi,
          biconomy.getSignerByAddress(userAddress)
        );

        const batchNonce = await forwarderContract.getNonce(userAddress, 0);
        //const batchId = await forwarderContract.getBatch(userAddress);

        console.log(batchNonce);
        const to = config.contract.address;
        const gasLimitNum = Number(gasLimit.toNumber().toString());
        console.log(gasLimitNum);
        const batchId = 0;
        const req = await buildForwardTxRequest({
          account: userAddress,
          to,
          gasLimitNum,
          batchId,
          batchNonce,
          data,
        });
        console.log(req);


        const hashToSign = getDataToSignForPersonalSign(req);
        walletSigner.signMessage(hashToSign)
          .then(function (sig) {
            console.log('signature ' + sig);
            sendTransaction({ userAddress, request: req, sig, signatureType: "PERSONAL_SIGN" });
          })
          .catch(function (error) {
            console.log(error)
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
        // getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const onSubmitWithPrivateKey = async () => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      try {
        if (metaTxEnabled) {
          let privateKey = "bf096e6fb9754860c4c99eb336c0579db994a3ef7fb3f7db869ad2f1972fc755";
          let userAddress = "0xf7AB2d00f379167c339691c23B23111eB598B3fb";
          let userSigner = new ethers.Wallet(privateKey);
          let { data } = await contract.populateTransaction.setQuote(newQuote);
          let gasPrice = await ethersProvider.getGasPrice();
          let gasLimit = await ethersProvider.estimateGas({
            to: config.contract.address,
            from: userAddress,
            data: data,
          });
          console.log(gasLimit.toString());
          console.log(gasPrice.toString());

          let forwarder = await getBiconomyForwarderConfig(42);
          let forwarderContract = new ethers.Contract(
            forwarder.address,
            forwarder.abi,
            biconomy.getSignerByAddress(userAddress)
          );

          const batchNonce = await forwarderContract.getNonce(userAddress, 0);
          //const batchId = await forwarderContract.getBatch(userAddress);

          console.log(batchNonce);
          const to = config.contract.address;
          const gasLimitNum = Number(gasLimit.toNumber().toString());
          console.log(gasLimitNum);
          const batchId = 0;
          const req = await buildForwardTxRequest({
            account: userAddress,
            to,
            gasLimitNum,
            batchId,
            batchNonce,
            data,
          });
          console.log(req);

          const hashToSign = getDataToSignForPersonalSign(req);

          const signature = await userSigner.signMessage(hashToSign);
          sendTransaction({
            userAddress,
            request: req,
            sig: signature,
            signatureType: "PERSONAL_SIGN",
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
          // getQuoteFromNetwork();
        }
      } catch (error) {
        console.log(error);
        handleClose();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  }

  const getQuoteFromNetwork = async () => {
    setLoadingMessage("Getting Quote from contact ...");
    let result = await contract.getQuote();
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
    handleClose();
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

  const sendTransaction = async ({ userAddress, request, sig, domainSeparator, signatureType }) => {
    if (ethersProvider && contract) {
      let params;
      if (domainSeparator) {
        params = [request, domainSeparator, sig];
      } else {
        params = [request, sig];
      }
      try {
        fetch(`${config.api.prod}/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key": config.apiKey.prod,
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            to: config.contract.address,
            apiId: "969f5d3b-c218-4552-97df-0f9bbaf924c0",
            params: params,
            from: userAddress,
            signatureType: signatureType
          }),
        })
          .then((response) => response.json())
          .then(function (result) {
            console.log(result);
            showInfoMessage(`Transaction sent by relayer with hash ${result.txHash}`);
            return result.txHash;
            // todo - fetch mined transaction receipt, show tx confirmed and update quotes
          }).then(function (hash) {
            //event emitter methods
            ethersProvider.once(hash, (transaction) => {
              // Emitted when the transaction has been mined
              console.log(transaction);
              setTransactionHash(hash);
              getQuoteFromNetwork();
            })
          })
          .catch(function (error) {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };


  return (
    <div className="App">
      <section className="top-row">
        <div className="top-row-item">
          <span className="label">Library </span>
          <span className="label-value">ethers.js</span>
        </div>
        <div className="top-row-item">
          <span className="label">Meta Transaction</span>
          <span className="label-value">EIP-2771</span>
        </div>
        <div className="top-row-item">
          <span className="label">Signature Type</span>
          <span className="label-value">EIP-712 Signature</span>
        </div>
      </section>
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
            <Button variant="contained" color="primary" onClick={onSubmitWithEIP712Sign} style={{ marginLeft: "10px" }}>
              Submit With EIP712 Sign
            </Button>
            <Button variant="contained" color="primary" onClick={onSubmitWithPersonalSign} style={{ marginLeft: "10px" }}>
              Submit With Personal Sign
            </Button>

            <Button variant="contained" color="secondary" onClick={onSubmitWithPrivateKey} style={{ marginLeft: "10px" }}>
              Submit (Private Key)
            </Button>
          </div>
        </div>
      </section>
      <Backdrop className={classes.backdrop} open={backdropOpen} onClick={handleClose}>
        <CircularProgress color="inherit" />
        <div style={{ paddingLeft: "10px" }}>{loadingMessage}</div>
      </Backdrop>
      <NotificationContainer />
    </div>
  );
}

export default App;