import React, { useState, useEffect } from "react";
import { useWeb3Context } from "../context/Web3Context";
import "../App.css";
import Button from "@material-ui/core/Button";
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
        address: "0x465F55aEaFB5291757c3E422663A206D13c1f2DF",
        abi: [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "admin", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getQuote", "outputs": [ { "internalType": "string", "name": "currentQuote", "type": "string" }, { "internalType": "address", "name": "currentOwner", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "forwarder", "type": "address" } ], "name": "isTrustedForwarder", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "quote", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "newQuote", "type": "string" } ], "name": "setQuote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_trustedForwarder", "type": "address" } ], "name": "setTrustedForwarder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "trustedForwarder", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "versionRecipient", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" } ]
    },
    walletFactory: {
        address: '0xB6D514655c1ed4A7ceeA2D717A3F37D7D8aEE90b',
        abi: [{"inputs":[{"internalType":"address","name":"_baseImpl","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_proxy","type":"address"},{"indexed":true,"internalType":"address","name":"_implementation","type":"address"},{"indexed":true,"internalType":"address","name":"_owner","type":"address"}],"name":"WalletCreated","type":"event"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_entryPoint","type":"address"},{"internalType":"address","name":"_handler","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"deployCounterFactualWallet","outputs":[{"internalType":"address","name":"proxy","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_entryPoint","type":"address"},{"internalType":"address","name":"_handler","type":"address"}],"name":"deployWallet","outputs":[{"internalType":"address","name":"proxy","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getAddressForCounterfactualWallet","outputs":[{"internalType":"address","name":"_wallet","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isWalletExist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]
    },
    apiKey: {
        test: "cNWqZcoBb.4e4c0990-26a8-4a45-b98e-08101f754119",
        prod: "OYbsENIqY.6ea6408b-8ac3-4149-80ad-9b1301accda3"
    },
    api: {
        test: "https://test-api.biconomy.io",
        prod: "https://api.biconomy.io"
    }
    
}

const EIP712_WALLET_TX_TYPE = {
    // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 targetTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
    WalletTx: [
        { type: "address", name: "to" },
        { type: "uint256", name: "value" },
        { type: "bytes", name: "data" },
        { type: "uint8", name: "operation" },
        { type: "uint256", name: "targetTxGas" },
        { type: "uint256", name: "baseGas" },
        { type: "uint256", name: "gasPrice" },
        { type: "address", name: "gasToken" },
        { type: "address", name: "refundReceiver" },
        { type: "uint256", name: "nonce" },
    ]
}

const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
];


let ethersProvider, walletProvider, walletSigner;
let contract, contractInterface;
let walletContract;
let biconomyWalletClient;

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

let biconomy;

function App() {
    const classes = useStyles();
    const preventDefault = (event) => event.preventDefault();
    const [backdropOpen, setBackdropOpen] = React.useState(true);
    const [loadingMessage, setLoadingMessage] = React.useState(" Loading Application ...");
    const [quote, setQuote] = useState("This is a default quote");
    const [owner, setOwner] = useState("Default Owner Address");
    const [newQuote, setNewQuote] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");
    const [ scwAddress, setSCWAddress ] = useState("");
    const [transactionHash, setTransactionHash] = useState("");

    const { connectWeb3, disconnect, account } = useWeb3Context();

    const handleClose = () => {
        setBackdropOpen(false);
    };

    const handleToggle = () => {
        setBackdropOpen(!backdropOpen);
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
                
                let jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/kvzXRzX2Ofr6PMqNot-QvPGRpimO7Cp_");
                // notice: uncomment signature piece L222 if you use jsonRpcProvider as first argument
                biconomy = new Biconomy(jsonRpcProvider,
                    { apiKey: config.apiKey.prod, // get api key from dashboard
                    // walletProvider: window.ethereum, 
                    debug: true });

                /*
                  This provider is linked to your wallet.
                  If needed, substitute your wallet solution in place of window.ethereum 
                */
                ethersProvider = new ethers.providers.Web3Provider(biconomy);
                walletProvider = new ethers.providers.Web3Provider(window.ethereum);
                walletSigner = walletProvider.getSigner();

                let userAddress = await walletSigner.getAddress()
                setSelectedAddress(userAddress);

                biconomy.onEvent(biconomy.READY, async () => {
                    console.log('Inside biconomy ready event');
                    // Initialize your dapp here like getting user accounts etc
                    contract = new ethers.Contract(
                        config.contract.address,
                        config.contract.abi,
                        biconomy.getSignerByAddress(userAddress)
                    );

                    walletContract = new ethers.Contract(
                        config.walletFactory.address,
                        config.walletFactory.abi,
                        biconomy.getSignerByAddress(userAddress)
                    );

                    biconomyWalletClient = biconomy.biconomyWalletClient;
                    contractInterface = new ethers.utils.Interface(config.contract.abi);
                    getQuoteFromNetwork();
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


    const onSubmitSCWTx = async event => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            const { data } = await contract.populateTransaction.setQuote(newQuote);
            console.log("data", data);
            console.log('Building tx');
            const safeTxBody = await biconomyWalletClient.buildExecTransaction({data, to:config.contract.address, walletAddress:scwAddress});
            console.log('safeTxBody', safeTxBody);


            //If json rpc provider is passed getting signature and sending below is must
            // get the signature from EOA
            // EIP712 sign
            // signing the transaction request
            const signature = await walletSigner._signTypedData({ verifyingContract: scwAddress, chainId: ethers.BigNumber.from("80001") }, EIP712_WALLET_TX_TYPE, safeTxBody)
            let newSignature = "0x";
            newSignature += signature.slice(2);

            //contact us for personal sign code snippet

            // New webHookAttributes
            let webHookAttributes = {
                "webHookId": "c838bd63-d219-40c4-a29d-44c223e31fe9", // replace webHookId that one gets from register webhookId
                "webHookData": {
                    "signedNonce": {"v": 2, "r": "2", "s": "4", "transactionHash": "0x111"},
                    "nonce": "1113",
                },
            };
            

            const txHash = await biconomyWalletClient.sendBiconomyWalletTransaction({execTransactionBody:safeTxBody, walletAddress:scwAddress, signature: newSignature, webHookAttributes}); // signature appended
            biconomy.getEthersProvider().once(txHash, (transaction) => {
                    // Emitted when the transaction has been mined
                    showSuccessMessage("Transaction confirmed on chain");
                    console.log(txHash);
                    setTransactionHash(txHash);
                    getQuoteFromNetwork();
                })

        } else {
            showErrorMessage("Please enter the quote");
        }
    };

    const onLoginWeb3 = async event => {
        try {
            console.log('Connecting to web3 wallet...');
            await connectWeb3();
            console.log('Wallet web3 connected...');
            console.log(`Checking if SCW exists for address: ${selectedAddress}`);
            const { doesWalletExist, walletAddress } = await biconomyWalletClient.checkIfWalletExists({eoa:selectedAddress, index:6}); // default index(salt) 0
            console.log('doesWalletExist', doesWalletExist);
            console.log('walletAddress:', walletAddress);
            if(!doesWalletExist) {
                console.log('Wallet does not exist');
                console.log('Deploying wallet');
                const walletAddress = await biconomyWalletClient.checkIfWalletExistsAndDeploy({eoa:selectedAddress, index:6}); // default index(salt) 0
                console.log('Wallet deployed at address', walletAddress);
                setSCWAddress(walletAddress);
            } else {
                console.log(`Wallet already exists for: ${selectedAddress}`);
                console.log(`Wallet address: ${walletAddress}`);
                setSCWAddress(walletAddress);
            }
        } catch (error) {
            console.log('onLogin error', error);
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
                    <span className="label-value">Custom Approach</span>
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

                <button onClick={onLoginWeb3} >
                    <div>{account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect Eth"}</div>
                </button>

                <div>
                <div className="submit-row">
                <p className="mb-author">Your SCW</p>
                </div>
                <p className="mb-author">{scwAddress ? scwAddress.slice(0,6)+"..."+scwAddress.slice(-4) : "Not detected"}</p>
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
                        <Button variant="contained" color="primary" onClick={onSubmitSCWTx} style={{ marginLeft: "10px" }}>
                            Submit SCW
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