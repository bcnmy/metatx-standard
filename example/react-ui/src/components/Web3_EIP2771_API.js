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

import Web3 from "web3";
import { Biconomy } from "@biconomy/mexa";
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");


let config = {
    contract: {
        address: "0x880176EDA9f1608A2Bf182385379bDcC1a65Dfcf",
        abi: [{ "inputs": [{ "internalType": "address", "name": "forwarder", "type": "address" }], "name": "isTrustedForwarder", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "quote", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "trustedForwarder", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [{ "internalType": "string", "name": "newQuote", "type": "string" }], "name": "setQuote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getQuote", "outputs": [{ "internalType": "string", "name": "currentQuote", "type": "string" }, { "internalType": "address", "name": "currentOwner", "type": "address" }], "stateMutability": "view", "type": "function", "constant": true }, { "inputs": [], "name": "versionRecipient", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function", "constant": true }]
    },
    apiKey: {
        test: "cNWqZcoBb.4e4c0990-26a8-4a45-b98e-08101f754119",
        prod: "8nvA_lM_Q.0424c54e-b4b2-4550-98c5-8b437d3118a9"
    },
    api: {
        test: "https://test-api.biconomy.io",
        prod: "https://api.biconomy.io"
    }
}

let web3, walletWeb3, biconomy;
let contract;

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

function App() {
    const classes = useStyles();
    const preventDefault = (event) => event.preventDefault();
    const [backdropOpen, setBackdropOpen] = React.useState(true);
    const [loadingMessage, setLoadingMessage] = React.useState(" Loading Application ...");
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
                let kovanProvider = new Web3.providers.HttpProvider("https://kovan.infura.io/v3/d126f392798444609246423b06116c77");
                setLoadingMessage("Initializing Biconomy ...");
                biconomy = new Biconomy(kovanProvider, {
                    walletProvider: window.ethereum,
                    apiKey: config.apiKey.prod,
                    debug: true
                });

                // This web3 instance is used to read normally and write to contract via meta transactions.
                web3 = new Web3(biconomy);

                // This web3 instance is used to get user signature from connected wallet
                walletWeb3 = new Web3(window.ethereum);

                biconomy.onEvent(biconomy.READY, () => {
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
                }).onEvent(biconomy.ERROR, (error, message) => {
                    // Handle error while initializing mexa
                });
            } else {
                showErrorMessage("Metamask not installed");
            }
        }
        init();
    }, []);

    const handleClose = () => {
        setBackdropOpen(false);
    };

    const handleToggle = () => {
        setBackdropOpen(!backdropOpen);
    };

    const onQuoteChange = event => {
        setNewQuote(event.target.value);
    };

    const onSubmitWithPrivateKey = async () => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            console.log("Sending meta transaction");
            let privateKey =
              "2ef295b86aa9d40ff8835a9fe852942ccea0b7c757fad5602dfa429bcdaea910";
            let userAddress = "0xE1E763551A85F04B4687f0035885E7F710A46aA6";
            let txGas = await contract.methods
                  .setQuote(newQuote)
                  .estimateGas({ from: userAddress });

            let functionSignature = contract.methods
              .setQuote(newQuote)
              .encodeABI();
            let forwarder = await getBiconomyForwarderConfig(42);
            let forwarderContract = new web3.eth.Contract(
              forwarder.abi,
              forwarder.address
            );

            const batchNonce = await forwarderContract.methods
              .getNonce(userAddress, 0)
              .call();
            //const batchId = await forwarderContract.methods.getBatch(userAddress).call();
            console.log(batchNonce);
            const to = config.contract.address;
            const gasLimitNum = Number(txGas);
            const batchId = 0;
            const request = await buildForwardTxRequest({
              account: userAddress,
              to,
              gasLimitNum,
              batchId,
              batchNonce,
              data: functionSignature,
            });
            console.log(request);

            //you do not need domain seperator in case of personal sign
            //const domainSeparator = await getDomainSeperator(42);
            //console.log(domainSeparator);

            //const dataToSign = await getDataToSignForEIP712(request, 42);
            //const sig = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: dataToSign }, 'V4');
            const messageToSign = getDataToSignForPersonalSign(request, 42);
            let {signature} = web3.eth.accounts.sign("0x" + messageToSign.toString("hex"), privateKey);
           
            sendTransaction({userAddress, request, sig:signature, signatureType:biconomy.PERSONAL_SIGN});  
            //notice domain seperator is not passed here         
        } else {
            showErrorMessage("Please enter the quote");
        }
    }

    const onSubmitWithEIP712 = async event => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            if (metaTxEnabled) {
                let userAddress = selectedAddress;

                let functionSignature = contract.methods
                  .setQuote(newQuote)
                  .encodeABI();

                debugger;

                let txGas = await contract.methods
                  .setQuote(newQuote)
                  .estimateGas({ from: userAddress });

                let forwarder = await getBiconomyForwarderConfig(42);
                let forwarderContract = new web3.eth.Contract(
                  forwarder.abi,
                  forwarder.address
                );

                const batchNonce = await forwarderContract.methods
                  .getNonce(userAddress, 0)
                  .call();
                //const batchId = await forwarderContract.methods.getBatch(userAddress).call();
                console.log(batchNonce);
                const to = config.contract.address;
                const gasLimitNum = Number(txGas);
                const batchId = 0;
                const request = await buildForwardTxRequest({account:userAddress,to,gasLimitNum,batchId,batchNonce,data:functionSignature});
                console.log(request);

                //you do not need domain seperator in case of personal sign
                const domainSeparator = await getDomainSeperator(42);
                console.log(domainSeparator);

                const dataToSign = await getDataToSignForEIP712(request,42);

                walletWeb3.currentProvider.send(
                    {
                        jsonrpc: "2.0",
                        id: 999999999999,
                        method: "eth_signTypedData_v4",
                        params: [userAddress, dataToSign]
                    },
                    function (error, response) {
                        console.info(`User signature is ${response.result}`);
                        if (error || (response && response.error)) {
                            showErrorMessage("Could not get user signature");
                        } else if (response && response.result) {
                            let sig = response.result;
                            sendTransaction({userAddress, request, domainSeparator, sig, signatureType:biconomy.EIP712_SIGN});
                        }
                    }
                );

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

    const onSubmitWithPersonal = async event => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            if (metaTxEnabled) {
                let userAddress = selectedAddress;

                let functionSignature = contract.methods
                  .setQuote(newQuote)
                  .encodeABI();

                debugger;

                let txGas = await contract.methods
                  .setQuote(newQuote)
                  .estimateGas({ from: userAddress });

                let forwarder = await getBiconomyForwarderConfig(42);
                let forwarderContract = new web3.eth.Contract(
                  forwarder.abi,
                  forwarder.address
                );

                const batchNonce = await forwarderContract.methods
                  .getNonce(userAddress, 0)
                  .call();
                //const batchId = await forwarderContract.methods.getBatch(userAddress).call();
                console.log(batchNonce);
                const to = config.contract.address;
                const gasLimitNum = Number(txGas);
                const batchId = 0;
                const request = await buildForwardTxRequest({account:userAddress,to,gasLimitNum,batchId,batchNonce,data:functionSignature});
                console.log(request);

                //you do not need domain seperator in case of personal sign
                //const domainSeparator = await getDomainSeperator(42);
                //console.log(domainSeparator);

                const hashToSign =  getDataToSignForPersonalSign(request);

                const sig = await walletWeb3.eth.personal.sign("0x" + hashToSign.toString("hex"), userAddress);

                console.log('signature ' + sig);
                sendTransaction({userAddress, request, sig, signatureType:"PERSONAL_SIGN"});

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

    const getQuoteFromNetwork = () => {
        setLoadingMessage("Getting Quote from contact ...");
        try {
            if (web3 && contract) {
                contract.methods
                    .getQuote()
                    .call()
                    .then(function (result) {
                        handleClose();
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
            } else {
                handleClose();
            }
        } catch (error) {
            handleClose();
            console.log(error);
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

    
    const sendTransaction = async ({userAddress, request, sig, domainSeparator, signatureType}) => {
        if (web3 && contract) {
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
                apiId: "34bfa8b9-57e7-4d32-b983-63c3f698cddd",
                //apiId: "ca45b2dc-0279-4952-87cd-bbc584427538",
                params: params,
                from: userAddress,
                signatureType: signatureType
              }),
            })
              .then((response) => response.json())
              .then(async function (result) {
                console.log(result);
                showInfoMessage(
                  `Transaction sent by relayer with hash ${result.txHash}`
                );

                let receipt = await getTransactionReceiptMined(
                  result.txHash,
                  2000
                );
                setTransactionHash(result.txHash);
                showSuccessMessage("Transaction confirmed on chain");
                getQuoteFromNetwork();
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
            <span className="label-value">web3.js</span>
          </div>
          <div className="top-row-item">
            <span className="label">Meta Transaction</span>
            <span className="label-value">EIP-2771</span>
          </div>
          <div className="top-row-item">
            <span className="label">Signature Type</span>
            <span className="label-value">EIP712 Signature</span>
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
                onClick={onSubmitWithEIP712}
              >
                Submit EIP712 Signature
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onSubmitWithPersonal}
              >
                Submit Personal Signature
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={onSubmitWithPrivateKey}
                style={{ marginLeft: "10px" }}
              >
                Submit (using private key)
              </Button>
            </div>
          </div>
        </section>
        <Backdrop
          className={classes.backdrop}
          open={backdropOpen}
          onClick={handleClose}
        >
          <CircularProgress color="inherit" />
          <div style={{ paddingLeft: "10px" }}>{loadingMessage}</div>
        </Backdrop>
        <NotificationContainer />
      </div>
    );
}

export default App;