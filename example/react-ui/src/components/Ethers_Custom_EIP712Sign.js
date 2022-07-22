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

import { ethers } from "ethers";
import { Biconomy } from "@biconomy/mexa";
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import Safe, { SafeFactory, SafeAccountConfig, EthSignSignature } from "@gnosis.pm/safe-core-sdk";
import SafeServiceClient from "@gnosis.pm/safe-service-client"; // v1.0.1
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util"); 	

let config = {
    contract: {
        address: "0xD6B86975B93df47942144B996d6c404e6Bfc514f",
        abi: [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"userAddress","type":"address"},{"indexed":false,"internalType":"addresspayable","name":"relayerAddress","type":"address"},{"indexed":false,"internalType":"bytes","name":"functionSignature","type":"bytes"}],"name":"MetaTransactionExecuted","type":"event"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"bytes","name":"functionSignature","type":"bytes"},{"internalType":"bytes32","name":"sigR","type":"bytes32"},{"internalType":"bytes32","name":"sigS","type":"bytes32"},{"internalType":"uint8","name":"sigV","type":"uint8"}],"name":"executeMetaTransaction","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getQuote","outputs":[{"internalType":"string","name":"currentQuote","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"quote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newQuote","type":"string"}],"name":"setQuote","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    },
    proxyContract: {
        address: "0xc4a53B88D37D50E6bde595c0CA1675F809E40718",
        abi: [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"}],"name":"AddedOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"approvedHash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"ApproveHash","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"handler","type":"address"}],"name":"ChangedFallbackHandler","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"guard","type":"address"}],"name":"ChangedGuard","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"threshold","type":"uint256"}],"name":"ChangedThreshold","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"module","type":"address"}],"name":"DisabledModule","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"module","type":"address"}],"name":"EnabledModule","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"txHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"payment","type":"uint256"}],"name":"ExecutionFailure","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"module","type":"address"}],"name":"ExecutionFromModuleFailure","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"module","type":"address"}],"name":"ExecutionFromModuleSuccess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"txHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"payment","type":"uint256"}],"name":"ExecutionSuccess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"}],"name":"RemovedOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"SafeReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"initiator","type":"address"},{"indexed":false,"internalType":"address[]","name":"owners","type":"address[]"},{"indexed":false,"internalType":"uint256","name":"threshold","type":"uint256"},{"indexed":false,"internalType":"address","name":"initializer","type":"address"},{"indexed":false,"internalType":"address","name":"fallbackHandler","type":"address"}],"name":"SafeSetup","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"msgHash","type":"bytes32"}],"name":"SignMsg","type":"event"},{"stateMutability":"nonpayable","type":"fallback"},{"inputs":[],"name":"VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"_threshold","type":"uint256"}],"name":"addOwnerWithThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"hashToApprove","type":"bytes32"}],"name":"approveHash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"approvedHashes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_threshold","type":"uint256"}],"name":"changeThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"dataHash","type":"bytes32"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"bytes","name":"signatures","type":"bytes"},{"internalType":"uint256","name":"requiredSignatures","type":"uint256"}],"name":"checkNSignatures","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"dataHash","type":"bytes32"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"bytes","name":"signatures","type":"bytes"}],"name":"checkSignatures","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"prevModule","type":"address"},{"internalType":"address","name":"module","type":"address"}],"name":"disableModule","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"domainSeparator","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"module","type":"address"}],"name":"enableModule","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"enum Enum.Operation","name":"operation","type":"uint8"},{"internalType":"uint256","name":"safeTxGas","type":"uint256"},{"internalType":"uint256","name":"baseGas","type":"uint256"},{"internalType":"uint256","name":"gasPrice","type":"uint256"},{"internalType":"address","name":"gasToken","type":"address"},{"internalType":"address","name":"refundReceiver","type":"address"},{"internalType":"uint256","name":"_nonce","type":"uint256"}],"name":"encodeTransactionData","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"enum Enum.Operation","name":"operation","type":"uint8"},{"internalType":"uint256","name":"safeTxGas","type":"uint256"},{"internalType":"uint256","name":"baseGas","type":"uint256"},{"internalType":"uint256","name":"gasPrice","type":"uint256"},{"internalType":"address","name":"gasToken","type":"address"},{"internalType":"address payable","name":"refundReceiver","type":"address"},{"internalType":"bytes","name":"signatures","type":"bytes"}],"name":"execTransaction","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"enum Enum.Operation","name":"operation","type":"uint8"}],"name":"execTransactionFromModule","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"enum Enum.Operation","name":"operation","type":"uint8"}],"name":"execTransactionFromModuleReturnData","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"returnData","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getChainId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"start","type":"address"},{"internalType":"uint256","name":"pageSize","type":"uint256"}],"name":"getModulesPaginated","outputs":[{"internalType":"address[]","name":"array","type":"address[]"},{"internalType":"address","name":"next","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOwners","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"offset","type":"uint256"},{"internalType":"uint256","name":"length","type":"uint256"}],"name":"getStorageAt","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"enum Enum.Operation","name":"operation","type":"uint8"},{"internalType":"uint256","name":"safeTxGas","type":"uint256"},{"internalType":"uint256","name":"baseGas","type":"uint256"},{"internalType":"uint256","name":"gasPrice","type":"uint256"},{"internalType":"address","name":"gasToken","type":"address"},{"internalType":"address","name":"refundReceiver","type":"address"},{"internalType":"uint256","name":"_nonce","type":"uint256"}],"name":"getTransactionHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"module","type":"address"}],"name":"isModuleEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"prevOwner","type":"address"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"_threshold","type":"uint256"}],"name":"removeOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"enum Enum.Operation","name":"operation","type":"uint8"}],"name":"requiredTxGas","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"handler","type":"address"}],"name":"setFallbackHandler","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"guard","type":"address"}],"name":"setGuard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_owners","type":"address[]"},{"internalType":"uint256","name":"_threshold","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"address","name":"fallbackHandler","type":"address"},{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"uint256","name":"payment","type":"uint256"},{"internalType":"address payable","name":"paymentReceiver","type":"address"}],"name":"setup","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"signedMessages","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"targetContract","type":"address"},{"internalType":"bytes","name":"calldataPayload","type":"bytes"}],"name":"simulateAndRevert","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"prevOwner","type":"address"},{"internalType":"address","name":"oldOwner","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"swapOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
    },
    gasEstimator: {
        address: "0x4abd3bd3f51dd9886c44d61A1Bf69E3FE742Ff9A",
        abi: [ { "inputs": [ { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "bytes", "name": "_data", "type": "bytes" } ], "name": "estimate", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "result", "type": "bytes" }, { "internalType": "uint256", "name": "gas", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" } ]
    },
    apiKey: {
        test: "cNWqZcoBb.4e4c0990-26a8-4a45-b98e-08101f754119",
        prod: "tVfE-w2BK.909aa1af-008b-4131-9712-9717fb480e92"
    },
    api: {
        test: "https://test-api.biconomy.io",
        prod: "https://api.biconomy.io"
    }
    
}

const EIP712_SAFE_TX_TYPE = {
    // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
    SafeTx: [
        { type: "address", name: "to" },
        { type: "uint256", name: "value" },
        { type: "bytes", name: "data" },
        { type: "uint8", name: "operation" },
        { type: "uint256", name: "safeTxGas" },
        { type: "uint256", name: "baseGas" },
        { type: "uint256", name: "gasPrice" },
        { type: "address", name: "gasToken" },
        { type: "address", name: "refundReceiver" },
        { type: "uint256", name: "nonce" },
    ]
}

const options = {
    dataZeroCost: 4,
    dataOneCost: 16,
    baseCost: 21000,
  };

const domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "address" },
    { name: "salt", type: "bytes32" },
];

const metaTransactionType = [
    { name: "nonce", type: "uint256" },
    { name: "from", type: "address" },
    { name: "functionSignature", type: "bytes" }
];

let domainData = {
    name: "TestContract",
    version: "1",
    verifyingContract: config.contract.address,
    salt: ethers.utils.hexZeroPad((ethers.BigNumber.from(42)).toHexString(), 32)
};

let ethersProvider,walletProvider, walletSigner;
let contract, contractInterface;
let ethAdapter;
let safeService;
let safeSdk;
let walletContract;
let estimator;
let ercForwarderClient, permitClient;

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
    const [metaTxEnabled, setMetaTxEnabled] = useState(true);
    const [transactionHash, setTransactionHash] = useState("");

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
                biconomy = new Biconomy(window.ethereum,
                    { apiKey: config.apiKey.prod, debug: true });

                /*
                  This provider is linked to your wallet.
                  If needed, substitute your wallet solution in place of window.ethereum 
                */
                ethersProvider = new ethers.providers.Web3Provider(biconomy);
                walletProvider = new ethers.providers.Web3Provider(window.ethereum);
                walletSigner = walletProvider.getSigner();
                let userAddress = await walletSigner.getAddress()
                setSelectedAddress(userAddress);

                ethAdapter = new EthersAdapter({
                    ethers,
                    signer: biconomy.getSignerByAddress(userAddress.toString().toLowerCase())
                });

                const txServiceUrl = 'https://safe-transaction.rinkeby.gnosis.io';
                safeService = new SafeServiceClient({ txServiceUrl, ethAdapter });

                

                biconomy.onEvent(biconomy.READY, async () => {

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

                    estimator = new ethers.Contract(
                        config.gasEstimator.address,
                        config.gasEstimator.abi,
                        walletProvider
                    );

                    ercForwarderClient = biconomy.erc20ForwarderClient;

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

    const onSubmitWithEIP712Sign = async event => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            if (metaTxEnabled) {
                showInfoMessage(`Getting user signature`);
                let userAddress = selectedAddress;
                let nonce = await contract.getNonce(userAddress);
                let functionSignature = contractInterface.encodeFunctionData("setQuote", [newQuote]);
                let message = {};
                message.nonce = parseInt(nonce);
                message.from = userAddress;
                message.functionSignature = functionSignature;

                const dataToSign = JSON.stringify({
                    types: {
                        EIP712Domain: domainType,
                        MetaTransaction: metaTransactionType
                    },
                    domain: domainData,
                    primaryType: "MetaTransaction",
                    message: message
                });

                // Its important to use eth_signTypedData_v3 and not v4 to get EIP712 signature because we have used salt in domain data
                // instead of chainId
                let signature = await walletProvider.send("eth_signTypedData_v3", [userAddress, dataToSign])
                let { r, s, v } = getSignatureParameters(signature);
                sendTransaction(userAddress, functionSignature, r, s, v);
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

    const onSubmitWithPrivateKey = async (event) => {
      if (newQuote != "" && contract) {
        setTransactionHash("");

        try {
          if (metaTxEnabled) {
            showInfoMessage(`Getting user signature`);
            let privateKey = 
              "2ef295b86aa9d40ff8835a9fe852942ccea0b7c757fad5602dfa429bcdaea910";
            let wallet = new ethers.Wallet(privateKey);
            let userAddress = "0xE1E763551A85F04B4687f0035885E7F710A46aA6";
            let nonce = await contract.getNonce(userAddress);
            let functionSignature = contractInterface.encodeFunctionData(
              "setQuote",
              [newQuote]
            );
            let message = {};
            message.nonce = parseInt(nonce);
            message.from = userAddress;
            message.functionSignature = functionSignature;

            // NOTE: DO NOT use JSON.stringify on dataToSign object
            const dataToSign = {
              types: {
                EIP712Domain: domainType,
                MetaTransaction: metaTransactionType,
              },
              domain: domainData,
              primaryType: "MetaTransaction",
              message: message,
            };

            // Its important to use eth_signTypedData_v3 and not v4 to get EIP712 signature because we have used salt in domain data
            // instead of chainId
            const signature = sigUtil.signTypedMessage(
              new Buffer.from(privateKey, "hex"),
              { data: dataToSign },
              "V3"
            );
            let { r, s, v } = getSignatureParameters(signature);
            sendTransaction(userAddress, functionSignature, r, s, v);
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
        } catch (error) {
          console.log(error);
          handleClose();
        }
      } else {
        showErrorMessage("Please enter the quote");
      }
    };

    const getSignatureParameters = signature => {
        if (!ethers.utils.isHexString(signature)) {
            throw new Error(
                'Given value "'.concat(signature, '" is not a valid hex string.')
            );
        }
        var r = signature.slice(0, 66);
        var s = "0x".concat(signature.slice(66, 130));
        var v = "0x".concat(signature.slice(130, 132));
        v = ethers.BigNumber.from(v).toNumber();
        if (![27, 28].includes(v)) v += 27;
        return {
            r: r,
            s: s,
            v: v
        };
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

    const txBaseCost = (data) => {
        const bytes = ethers.utils.arrayify(data);
        return bytes
          .reduce(
            (p, c) =>
              c === 0 ? p.add(options.dataZeroCost) : p.add(options.dataOneCost),
            ethers.constants.Zero
          )
          .add(options.baseCost)
          .toNumber();
    };

    const sendTransaction = async (userAddress, functionData, r, s, v) => {
        if (ethersProvider && contract) {
            try {
                fetch(`${config.api.prod}/api/v2/meta-tx/native`, {
                    method: "POST",
                    headers: {
                      "x-api-key" : config.apiKey.prod,
                      'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({
                      "to": config.contract.address,
                      "apiId": "ab6a62bf-c58f-4040-9084-0fad85f3345a",
                    //"apiId": "f93b5089-574e-47b7-92a1-2a9fff66215a",
                      "params": [userAddress, functionData, r, s, v],
                      "from": userAddress
                    })
                  })
                  .then(response=>response.json())
                  .then(async function(result) {
                    console.log(result);
                    showInfoMessage(`Transaction sent by relayer with hash ${result.txHash}`);
                    let receipt = await ethersProvider.waitForTransaction(
                        result.txHash
                      );
                      console.log(receipt);
                    setTransactionHash(receipt.transactionHash);
                    showSuccessMessage("Transaction confirmed on chain");
                    getQuoteFromNetwork();
                  }).catch(function(error) {
                      console.log(error)
                    });
            } catch (error) {
                console.log(error);
            }
        }
    };

    const onSubmitSCWTx = async event => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            debugger;
            const operation = 0; // CALL

            const tokenGasPrice = await ercForwarderClient.getTokenGasPrice(biconomy.daiTokenAddress);
            console.log('tokenGasPrice');
            console.log(tokenGasPrice);

            let safeSdk = await Safe.create({ ethAdapter, safeAddress: config.proxyContract.address });

            let functionSignature = contractInterface.encodeFunctionData(
                "setQuote",
                [newQuote]
              );

            debugger;
            const transaction = {
                to: "0x7306aC7A32eb690232De81a9FFB44Bb346026faB",
                data: "0x",
                value: "10000",
              };
            console.log(transaction);
            transaction.nonce = await safeSdk.getNonce();

            console.log(transaction);
              
            
            const safeTransaction = await safeSdk.createTransaction(transaction);
            
            const txGasEstimate = await safeService.estimateSafeTransaction(
                config.proxyContract.address,
                {
                    to: safeTransaction.data.to,
                    value: safeTransaction.data.value,
                    data: safeTransaction.data.data,
                    operation: safeTransaction.data.operation
                }
            );
            console.log(txGasEstimate);



            const gasPrice = Number(tokenGasPrice); // If 0, then no refund to relayer //high gas price
            const gasToken = '0x0000000000000000000000000000000000000000'; // ETH
            const executor = '0x0000000000000000000000000000000000000000';

            // safeTransaction.data.baseGas = Number(txGasEstimate.safeTxGas); //non-zero value
            safeTransaction.data.safeTxGas = Number(txGasEstimate.safeTxGas);
            safeTransaction.data.gasPrice = gasPrice;
            safeTransaction.data.gasToken = gasToken;
            safeTransaction.data.refundReceiver = executor;

            /*const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
            const signatureGnosis = await safeSdk.signTransactionHash(safeTxHash);

  
            safeTransaction.addSignature(signatureGnosis);

            const estimatorInterface = new ethers.utils.Interface(config.gasEstimator.abi);
            const walletInterface = new ethers.utils.Interface(config.proxyContract.abi);
            const encodedEstimate = estimatorInterface.encodeFunctionData(
                "estimate",
                [
                  config.proxyContract.address,
                  walletInterface.encodeFunctionData("execTransaction", [
                    safeTransaction.data.to,
                    safeTransaction.data.value,
                    safeTransaction.data.data,
                    safeTransaction.data.operation,
                    safeTransaction.data.safeTxGas,
                    safeTransaction.data.baseGas,
                    safeTransaction.data.gasPrice,
                    safeTransaction.data.gasToken,
                    safeTransaction.data.refundReceiver,
                    signatureGnosis.data,
                  ]),
                ]
            );

            const response = await walletProvider.send("eth_call", [
                {
                  to: config.gasEstimator.address,
                  data: encodedEstimate,
                  from: selectedAddress,
                  // gasPrice: ethers.BigNumber.from(100000000000).toHexString(),
                  // gas: "200000",
                },
                "latest",
              ]);

            const decoded = estimatorInterface.decodeFunctionResult(
                "estimate",
                response
            );

            const execTransactionGas = ethers.BigNumber.from(decoded.gas)
                .add(txBaseCost(encodedEstimate))
                .toNumber();

            console.log("estimated gas to be used ", execTransactionGas);*/

            
            
            let safeSdk2;
            safeSdk2 = await safeSdk.connect(new EthersAdapter({
                ethers,
                signer: biconomy.getSignerByAddress("0x8c2a86E058228401D40d04b4D4Bf4f9B239d547f")
            }), config.proxyContract.address);
                  
            // safeTransaction.data.baseGas = execTransactionGas - txGasEstimate.safeTxGas + 36235 + 5000;
            safeTransaction.data.baseGas = 47872; //24828 + 7325 + 8631 + 16734; 
            // initial gas + handle payment + sig verification gas + constant computation

            const safeTxHash2 = await safeSdk.getTransactionHash(safeTransaction);
            const signatureGnosis2 = await safeSdk.signTransactionHash(safeTxHash2);
  
            safeTransaction.addSignature(signatureGnosis2);
            console.log(safeTransaction);
        
            const executeTxResponse = await safeSdk2.executeTransaction(safeTransaction, {gasLimit: 200000});

            /// Notes:
            /// Latest tx : https://rinkeby.etherscan.io/txs?a=0xc4a53b88d37d50e6bde595c0ca1675f809e40718
            /// above has to be tested with setQuote again
            /// and see if above overherads behave the same
            // Done : https://rinkeby.etherscan.io/tx/0xca8000b48c2fbe7a4433fc7d5f1ede7a7e867f1c5fe5ac16800444774983e209
            /// 36235 is taken as offset for safeTxGas estimation between requiredTxGas and what gnosis returns from api
            /// 5000 is offset for relayer protection
            /// other:
            /// i) relayer needs to accept txn before relaying! this can only be known once you know how much a wallet is gonna pay!
            /// ii) signature should not be taken twice (once to estimate and once to do actual txn!)
            /// can have seperate baseContract execTransaction function which doesn't do signature verification!
            
        } else {
            showErrorMessage("Please enter the quote");
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
                            Submit
            </Button>
            <Button variant="contained" color="primary" onClick={onSubmitSCWTx} style={{ marginLeft: "10px" }}>
                            Submit SCW
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