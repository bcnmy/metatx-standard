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
        address: "0xB32992b4110257a451Af3c2ED6AC78776DD8C26b",
        abi: [ { "inputs": [ { "internalType": "string", "name": "newQuote", "type": "string" } ], "name": "setQuote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getQuote", "outputs": [ { "internalType": "string", "name": "currentQuote", "type": "string" }, { "internalType": "address", "name": "currentOwner", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "quote", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" } ]
    },
    proxyContract: {
        address: "0x08e4ad0ce62fd435827557825349dcc2b752c8e7",
        abi: [ { "inputs": [ { "internalType": "address", "name": "_guardian", "type": "address" } ], "name": "addGuardian", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "module", "type": "address" } ], "name": "DisabledModule", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "prevModule", "type": "address" }, { "internalType": "address", "name": "module", "type": "address" } ], "name": "disableModule", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "module", "type": "address" } ], "name": "EnabledModule", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "module", "type": "address" } ], "name": "enableModule", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "oldEntryPoint", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newEntryPoint", "type": "address" } ], "name": "EntryPointChanged", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "func", "type": "bytes" } ], "name": "exec", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address[]", "name": "dest", "type": "address[]" }, { "internalType": "bytes[]", "name": "func", "type": "bytes[]" } ], "name": "execBatch", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "func", "type": "bytes" } ], "name": "execFromEntryPoint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "enum Enum.Operation", "name": "operation", "type": "uint8" }, { "internalType": "uint256", "name": "safeTxGas", "type": "uint256" }, { "internalType": "uint256", "name": "baseGas", "type": "uint256" }, { "internalType": "uint256", "name": "gasPrice", "type": "uint256" }, { "internalType": "address", "name": "gasToken", "type": "address" }, { "internalType": "address payable", "name": "refundReceiver", "type": "address" }, { "internalType": "bytes", "name": "signatures", "type": "bytes" } ], "name": "execTransaction", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" } ], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "enum Enum.Operation", "name": "operation", "type": "uint8" } ], "name": "execTransactionFromModule", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "enum Enum.Operation", "name": "operation", "type": "uint8" } ], "name": "execTransactionFromModuleReturnData", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "returnData", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "txHash", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "payment", "type": "uint256" } ], "name": "ExecutionFailure", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "module", "type": "address" } ], "name": "ExecutionFromModuleFailure", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "module", "type": "address" } ], "name": "ExecutionFromModuleSuccess", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "bytes32", "name": "txHash", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "payment", "type": "uint256" } ], "name": "ExecutionSuccess", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "newImplementation", "type": "address" } ], "name": "ImplementationUpdated", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "address", "name": "_entryPoint", "type": "address" } ], "name": "init", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" } ], "name": "Initialized", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_guardian", "type": "address" } ], "name": "revokeGuardian", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_newOwner", "type": "address" } ], "name": "setOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_entryPoint", "type": "address" } ], "name": "updateEntryPoint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_implementation", "type": "address" } ], "name": "updateImplementation", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "bytes", "name": "initCode", "type": "bytes" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }, { "internalType": "uint256", "name": "callGas", "type": "uint256" }, { "internalType": "uint256", "name": "verificationGas", "type": "uint256" }, { "internalType": "uint256", "name": "preVerificationGas", "type": "uint256" }, { "internalType": "uint256", "name": "maxFeePerGas", "type": "uint256" }, { "internalType": "uint256", "name": "maxPriorityFeePerGas", "type": "uint256" }, { "internalType": "address", "name": "paymaster", "type": "address" }, { "internalType": "bytes", "name": "paymasterData", "type": "bytes" }, { "internalType": "bytes", "name": "signature", "type": "bytes" } ], "internalType": "struct UserOperation", "name": "userOp", "type": "tuple" }, { "internalType": "bytes32", "name": "requestId", "type": "bytes32" }, { "internalType": "uint256", "name": "requiredPrefund", "type": "uint256" } ], "name": "validateUserOp", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "bytes", "name": "signatures", "type": "bytes" } ], "name": "checkSignatures", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "domainSeparator", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "enum Enum.Operation", "name": "operation", "type": "uint8" }, { "internalType": "uint256", "name": "safeTxGas", "type": "uint256" }, { "internalType": "uint256", "name": "baseGas", "type": "uint256" }, { "internalType": "uint256", "name": "gasPrice", "type": "uint256" }, { "internalType": "address", "name": "gasToken", "type": "address" }, { "internalType": "address", "name": "refundReceiver", "type": "address" }, { "internalType": "uint256", "name": "_nonce", "type": "uint256" } ], "name": "encodeTransactionData", "outputs": [ { "internalType": "bytes", "name": "", "type": "bytes" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "entryPoint", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getChainId", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "batchId", "type": "uint256" } ], "name": "getNonce", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }, { "internalType": "enum Enum.Operation", "name": "operation", "type": "uint8" }, { "internalType": "uint256", "name": "safeTxGas", "type": "uint256" }, { "internalType": "uint256", "name": "baseGas", "type": "uint256" }, { "internalType": "uint256", "name": "gasPrice", "type": "uint256" }, { "internalType": "address", "name": "gasToken", "type": "address" }, { "internalType": "address", "name": "refundReceiver", "type": "address" }, { "internalType": "uint256", "name": "_nonce", "type": "uint256" } ], "name": "getTransactionHash", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "guardians", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_guardian", "type": "address" } ], "name": "isGuardian", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "module", "type": "address" } ], "name": "isModuleEnabled", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "nonces", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "bytes", "name": "", "type": "bytes" } ], "name": "onERC1155BatchReceived", "outputs": [ { "internalType": "bytes4", "name": "", "type": "bytes4" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" } ], "name": "onERC1155Received", "outputs": [ { "internalType": "bytes4", "name": "", "type": "bytes4" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" } ], "name": "onERC721Received", "outputs": [ { "internalType": "bytes4", "name": "", "type": "bytes4" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes4", "name": "_interfaceID", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "VERSION", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" } ]
    },
    apiKey: {
        test: "cNWqZcoBb.4e4c0990-26a8-4a45-b98e-08101f754119",
        prod: "zIH7h7lcK.e5a9aa8f-0acb-4ce9-ba1d-5097073c4ab4"
    },
    api: {
        test: "https://test-api.biconomy.io",
        prod: "https://api.biconomy.io"
    }
    
}

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
                biconomy = new Biconomy(new ethers.providers.JsonRpcProvider("https://kovan.infura.io/v3/d126f392798444609246423b06116c77"),
                    { apiKey: 'EafQYL7lt.2e94b782-9d7d-4bf2-98d5-b5dd52d7f5e9', debug: true });

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
                        config.proxyContract.address,
                        config.proxyContract.abi,
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
            const safeTxBody = await biconomyWalletClient.buildExecTransaction(data, config.contract.address, '0x08e4ad0ce62fd435827557825349dcc2b752c8e7', 0);
            console.log('safeTxBody', safeTxBody);

            const nonce = await walletContract.getNonce(0);
            console.log("nonce", nonce);

            const result = await biconomyWalletClient.sendBiconomyWalletTransaction(safeTxBody, selectedAddress, '0x08e4ad0ce62fd435827557825349dcc2b752c8e7');
            console.log(result);

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
            debugger;
            const { doesWalletExist, walletAddress } = await biconomyWalletClient.checkIfWalletExists(selectedAddress, 0);
            console.log('doesWalletExist', doesWalletExist);
            console.log('walletAddress:', walletAddress);
            if(!doesWalletExist) {
                debugger;
                console.log('Wallet does not exist');
                console.log('Deploying wallet');
                const walletAddress = await biconomyWalletClient.checkIfWalletExistsAndDeploy(selectedAddress, 0);
                console.log('Wallet deployed at address', walletAddress);
            } else {
                console.log(`Wallet already exists for: ${selectedAddress}`);
                console.log(`Wallet address: ${walletAddress}`);
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