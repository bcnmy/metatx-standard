import React, { useState, useEffect } from "react";
import "../App.css";
import Button from "@material-ui/core/Button";
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
    }
}




let web3, biconomy;
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
    const [backdropOpen, setBackdropOpen] = React.useState(true);
    const [loadingMessage, setLoadingMessage] = React.useState(" Loading Application ...");
    const [quote, setQuote] = useState("This is a default quote");
    const [owner, setOwner] = useState("Default Owner Address");
    const [newQuote, setNewQuote] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");
    const [metaTxEnabled] = useState(true);
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
                }).onEvent(biconomy.ERROR, () => {
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


    const onQuoteChange = event => {
        setNewQuote(event.target.value);
    };

    const onSubmitWithPrivateKey = async () => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            console.log("Sending meta transaction");
            let privateKey = "2ef295b86aa9d40ff8835a9fe852942ccea0b7c757fad5602dfa429bcdaea910";
            let userAddress = "0xE1E763551A85F04B4687f0035885E7F710A46aA6";
            let txParams = {
                "from": userAddress,
                "to": config.contract.address,
                "data": contract.methods.setQuote(newQuote).encodeABI(),
                "gasLimit": web3.utils.toHex(300000),
            };
            const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
            const forwardData = await biconomy.getForwardRequestAndMessageToSign(signedTx.rawTransaction);

            console.log(forwardData);
            console.log(privateKey);
            // const signature = sigUtil.personalSign(new Buffer.from(privateKey, 'hex'), { data: forwardData.personalSignatureFormat });
            let {signature} = web3.eth.accounts.sign("0x" + forwardData.personalSignatureFormat.toString("hex"), privateKey);
            
            let rawTransaction = signedTx.rawTransaction;
            let data = {
                signature: signature,
                forwardRequest: forwardData.request,
                rawTransaction: rawTransaction,
                signatureType: biconomy.PERSONAL_SIGN
            };

            web3.eth.sendSignedTransaction(data)
                .on('transactionHash', (hash) => {
                    console.log(`Transaction hash is ${hash}`)
                    showInfoMessage(`Transaction sent via Biconomy. Waiting for confirmation.`);
                })
                .once('confirmation', (confirmation, receipt) => {
                    console.log(`Transaction Confirmed.`);
                    console.log(receipt);
                    setTransactionHash(receipt.transactionHash);
                    showSuccessMessage("Transaction confirmed");
                    getQuoteFromNetwork();
                });

        } else {
            showErrorMessage("Please enter the quote");
        }
    }

    const onSubmit = async () => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            if (metaTxEnabled) {
             try{
                let tx = contract.methods.setQuote(newQuote).send({
                    from: selectedAddress,
                    signatureType: biconomy.PERSONAL_SIGN
                });

                tx.on("transactionHash", function (hash) {
                    console.log(`Transaction hash is ${hash}`);
                    showInfoMessage(`Transaction sent. Waiting for confirmation ..`);
                }).once("confirmation", function (confirmationNumber, receipt) {
                    console.log(receipt);
                    setTransactionHash(receipt.transactionHash);
                    showSuccessMessage("Transaction confirmed on chain");
                    getQuoteFromNetwork();
                }).on('error', function(error,receipt) {
                    console.log(error);
                });
            } catch (err) {
                console.log("handle errors like signature denied here");
                console.log(err);
            }
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
                    <span className="label-value">Personal Signature</span>
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
                        <Button variant="contained" color="primary" onClick={onSubmit}>
                            Submit
            </Button>
                        <Button variant="contained" color="primary" onClick={onSubmitWithPrivateKey} style={{ marginLeft: "10px" }}>
                            Submit (using private key)
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