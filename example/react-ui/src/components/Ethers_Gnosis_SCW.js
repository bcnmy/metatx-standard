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

// Gnosis imports
import { ethers } from "ethers";
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import Safe, { SafeFactory, SafeAccountConfig } from '@gnosis.pm/safe-core-sdk'
import SafeServiceClient from "@gnosis.pm/safe-service-client"; // v1.0.1

import { Biconomy } from "@biconomy/mexa";

import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");

let config = {
    contract: {
        address: "0x84d32E5921BA27A685BE39c5D29De833225700be",
        abi: [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "admin", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getQuote", "outputs": [ { "internalType": "string", "name": "currentQuote", "type": "string" }, { "internalType": "address", "name": "currentOwner", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "name": "isTrustedForwarder", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "quote", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "newQuote", "type": "string" } ], "name": "setQuote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_trustedForwarder", "type": "address" } ], "name": "setTrustedForwarder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "trustedForwarder", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "versionRecipient", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" } ]
    },
    apiKey: {
        test: "cNWqZcoBb.4e4c0990-26a8-4a45-b98e-08101f754119",
        prod: "69fyMOQpv.27a2028e-f706-4c63-9532-839980dcbf10"
    }
}

let walletProvider, walletSigner;
let contract, contractInterface;
let userAddress, safeService;
let ethAdapter;

let biconomy;
let gnosisWalletClient;

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
                // let jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://eth-rinkeby.alchemyapi.io/v2/bm4jnWov7s3JQsotY9JUHIjWAFyVRXFh");
                // biconomy = new Biconomy(window.ethereum, {
                //     apiKey: config.apiKey.prod,
                //     debug: true
                // });

                try {
                    biconomy = new Biconomy(window.ethereum,
                        { 
                            apiKey: config.apiKey.prod, // get api key from dashboard
                            contractAddresses: [config.contract.address]
                        });
                    await biconomy.init();
                } catch (error) {
                    console.log(error);
                }

                /*
                  This provider is linked to your wallet.
                  If needed, substitute your wallet solution in place of window.ethereum 
                */
                walletProvider = new ethers.providers.Web3Provider(window.ethereum);
                walletSigner = walletProvider.getSigner();

                userAddress = await walletSigner.getAddress()
                setSelectedAddress(userAddress);

                // biconomy.onEvent(biconomy.READY, async () => {

                    // Initialize your dapp here like getting user accounts etc
                    contract = new ethers.Contract(
                        config.contract.address,
                        config.contract.abi,
                        biconomy.getSignerByAddress(userAddress.toString().toLowerCase())
                    );

                    gnosisWalletClient = biconomy.gnosisWalletClient;
                    const isEthersAdapterSet = await gnosisWalletClient.setEthersAdapter(userAddress);
                    console.log('isEthersAdapterSet', isEthersAdapterSet);
                    

                    const txServiceUrl = 'https://safe-transaction.rinkeby.gnosis.io';
                    safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });

                    contractInterface = new ethers.utils.Interface(config.contract.abi);
                    getQuoteFromNetwork();
                // }).onEvent(biconomy.ERROR, (error, message) => {
                //     // Handle error while initializing mexa
                //     console.log(message);
                //     console.log(error);
                // });
            } else {
                showErrorMessage("Metamask not installed");
            }
        }
        init();
    }, []);

    const onQuoteChange = event => {
        setNewQuote(event.target.value);
    };


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

    const onSubitWithGnosisSCW =  async () => {
        try {
            /**If new safe */
            // create safeFactory instance. await SafeFactory.create({ ethAdapter })
            const safeFactory = await SafeFactory.create({ ethAdapter })
            const owners = [userAddress]
            const threshold = 2;
            const safeAccountConfig = {
                owners,
                threshold,
            }

            const safeSdk = await gnosisWalletClient.createNewGnosisSafe(safeAccountConfig);
            console.log('safeSdk', safeSdk);
            // console.log('Deploying safe...');
            // deploy safe (gasless). await safeFactory.deploySafe({ safeAccountConfig })
            // const safeSdk = await safeFactory.deploySafe({ safeAccountConfig })
            // console.log('Safe deployed...');
            // to get address. const address = safeSdk.getAddress()
            // const newSafeAddress = safeSdk.getAddress();
            // console.log('new safe address', newSafeAddress);
            // const safeSdk = await Safe.create({ethAdapter, safeAddress: '0xaF1CDF95f76aF50D78a6378fA072FcD6dA2648b4'})
            // create transaction. const safeTransaction = await safeSdk.createTransaction(transaction)
            // const { data } = await contract.populateTransaction.setQuote(newQuote);

            // const transaction = {
            //     to: config.contract.address,
            //     value: 0,
            //     data: data,
            //     nonce: await safeSdk.getNonce()
            // }

            // const safeTransaction = await safeSdk.createTransaction(transaction);
            // console.log('safeTransaction: ', safeTransaction);

            // const txGasEstimate = await safeService.estimateSafeTransaction(
            //     '0xaF1CDF95f76aF50D78a6378fA072FcD6dA2648b4',
            //     {
            //         to: safeTransaction.data.to,
            //         value: safeTransaction.data.value,
            //         data: safeTransaction.data.data,
            //         operation: safeTransaction.data.operation
            //     }
            // );
            // console.log('txGasEstimate', txGasEstimate);

            // const txHash = await safeSdk.getTransactionHash(safeTransaction);
            // const signature = await safeSdk.signTransactionHash(txHash);
            // console.log('signature', signature);
            // safeTransaction.addSignature(signature);
            // const gasPrice = 0; 
            // const gasToken = '0x0000000000000000000000000000000000000000'; 
            // const executor = '0x0000000000000000000000000000000000000000';

            // safeTransaction.data.baseGas = 0; 
            // safeTransaction.data.safeTxGas = 0;
            // safeTransaction.data.gasPrice = gasPrice;
            // safeTransaction.data.gasToken = gasToken;
            // safeTransaction.data.refundReceiver = executor;
            // const executeTxResponse = await safeSdk.executeTransaction(safeTransaction, {gasLimit: 500000});
            // console.log('executeTxResponse', executeTxResponse);

            /**If safe already exists */
            // connect to a safe. await Safe.create({ ethAdapter, safeAddress }), await safeSdk.connect({ ethAdapter, safeAddress })

        } catch (error) {
            console.log(error)
        }
    }

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
                        <Button variant="contained" color="primary" onClick={onSubitWithGnosisSCW} style={{ marginLeft: "10px" }}>
                            Submit With Gnosis SCW
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