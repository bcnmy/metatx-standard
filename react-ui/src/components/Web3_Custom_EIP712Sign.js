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
import { ethers } from "ethers";
import { Biconomy } from "@biconomy/mexa";

import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");

let config = {
    contract: {
        // Transfer handler contract Kovan
        address: "0x0B0c3490821cdBAa34AE2C67Cda4D8B14C08E271",
        abi: [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint128","name":"newBaseGas","type":"uint128"},{"indexed":true,"internalType":"address","name":"actor","type":"address"}],"name":"BaseGasChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"charge","type":"uint256"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"FeeCharged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newFeeReceiver","type":"address"},{"indexed":true,"internalType":"address","name":"actor","type":"address"}],"name":"FeeReceiverChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"userAddress","type":"address"},{"indexed":false,"internalType":"addresspayable","name":"relayerAddress","type":"address"},{"indexed":false,"internalType":"bytes","name":"functionSignature","type":"bytes"}],"name":"MetaTransactionExecuted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"address","name":"actor","type":"address"},{"indexed":true,"internalType":"uint256","name":"newGas","type":"uint256"}],"name":"TransferHandlerGasChanged","type":"event"},{"inputs":[],"name":"REQUEST_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseGas","outputs":[{"internalType":"uint128","name":"","type":"uint128"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"bytes","name":"functionSignature","type":"bytes"},{"internalType":"bytes32","name":"sigR","type":"bytes32"},{"internalType":"bytes32","name":"sigS","type":"bytes32"},{"internalType":"uint8","name":"sigV","type":"uint8"}],"name":"executeMetaTransaction","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"feeMultiplier","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getTransferNonce","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maximumMarkup","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"internalType":"structTransferHandlerCustom.TokenTransferRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"sigR","type":"bytes32"},{"internalType":"bytes32","name":"sigS","type":"bytes32"},{"internalType":"uint8","name":"sigV","type":"uint8"},{"components":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"allowed","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"internalType":"structTransferHandlerCustom.PermitRequest","name":"permitOptions","type":"tuple"}],"name":"permitEIP2612AndTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint128","name":"gas","type":"uint128"}],"name":"setBaseGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_bp","type":"uint16"}],"name":"setDefaultFeeMultiplier","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeReceiver","type":"address"}],"name":"setFeeReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"_transferHandlerGas","type":"uint256"}],"name":"setTransferHandlerGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"transferHandlerGas","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    },
    apiKey: {
        test: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209",
        prod: "8nvA_lM_Q.0424c54e-b4b2-4550-98c5-8b437d3118a9"
    }
}

// kovan USDC
config.usdc = {
    address: "0x6043fD7126e4229d6FcaC388c9E1C8d333CCb8fA",
    abi: [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"initialBalance","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"Blacklisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newBlacklister","type":"address"}],"name":"BlacklisterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newMasterMinter","type":"address"}],"name":"MasterMinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"MinterConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"UnBlacklisted","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"APPROVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"INCREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"approveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"enumGasAbstraction.AuthorizationState","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"blacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklister","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},
  {"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"},{"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"configureMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currency","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"decreaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"increaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenName","type":"string"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"string","name":"tokenCurrency","type":"string"},{"internalType":"uint8","name":"tokenDecimals","type":"uint8"},{"internalType":"address","name":"newMasterMinter","type":"address"},{"internalType":"address","name":"newPauser","type":"address"},{"internalType":"address","name":"newBlacklister","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"}],"name":"initializeV2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"masterMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"minterAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contractIERC20","name":"tokenContract","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBlacklister","type":"address"}],"name":"updateBlacklister","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMasterMinter","type":"address"}],"name":"updateMasterMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newPauser","type":"address"}],"name":"updatePauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"updateRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"}] 
  };

//this changes for all EIP712Sign variations of custom approach 
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

// domain data for kovan USDC
let usdcDomainData = {
  name: "USDC Coin",
  version: "1",
  chainId: 42,
  verifyingContract: config.usdc.address,
};

const tokenDecimals = 18;

let usdcDomainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

let eip2612PermitType = [
  { name: "owner", type: "address" },
  { name: "spender", type: "address" },
  { name: "value", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "deadline", type: "uint256" },
];

let tokenTransferRequestType = [
    { name: "batchId", type: "uint256" },
    { name: "batchNonce", type: "uint256" },
    { name: "from", type: "address" },
    { name: "tokenGasPrice", type: "uint256" },
    { name: "token", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
  ];

let domainData = {
    name: "ERC20Transfer",
    version: "1",
    verifyingContract: config.contract.address,
    salt: ethers.utils.hexZeroPad((ethers.BigNumber.from(42)).toHexString(), 32) //NOTE: replace chainId from 42 to 1 for mainnet
};

let walletProvider, walletSigner;
let web3, walletWeb3;
let contract;
let usdcToken;

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
let ercForwarderClient, permitClient;

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
                biconomy = new Biconomy(new ethers.providers.JsonRpcProvider("https://kovan.infura.io/v3/190611c4be284c0193d645d80947a851"),
                    { apiKey: config.apiKey.prod, debug: true });

                 // This web3 instance is used to read normally and write to contract via meta transactions.
                 web3 = new Web3(biconomy);

                // below code L149 - 160 is in the context of front end interaction from metamask and wont be needed when using private key // 
                 // This web3 instance is used to get user signature from connected wallet
                walletWeb3 = new Web3(window.ethereum);

                /*
                  This provider is linked to your wallet.
                  If needed, substitute your wallet solution in place of window.ethereum 
                */
                walletProvider = new ethers.providers.Web3Provider(window.ethereum);
                walletSigner = walletProvider.getSigner();

                let userAddress = await walletSigner.getAddress()
                setSelectedAddress(userAddress);

                biconomy.onEvent(biconomy.READY, async () => {
 
                      contract = new web3.eth.Contract(
                        config.contract.abi,
                        config.contract.address
                    );

                    usdcToken = new web3.eth.Contract(
                        config.usdc.abi,
                        config.usdc.address
                    );

                    ercForwarderClient = biconomy.erc20ForwarderClient;
                    permitClient = biconomy.permitClient;

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

    // use this method for permit and transfer
    // method to register on the dashboard is permitEIP2612AndTransfer (use identity verification is done from permit signature hence method can be called directly)
    const onPermitAndTransferWithPrivateKey = async event => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            if (metaTxEnabled) {
                showInfoMessage(`Getting user signature`);
                let privateKey = "f78b11516983e1450ac8e4dc636a737cd24574d77cefb7def83f15eef0c8216c";
                let userAddressCustom = "0x90d25917D46b5b6c92c0f213A4BA83698d36A97C"; // update your user(sender) address per private key and replace userAddress
                let receiver = "0xFAd8e64BF2d15B28a87Fcdf441AD9f8f38757a02";
                let userAddress = userAddressCustom;
                debugger;
                let batchId = 0;
                let transferNonce = await contract.methods.getTransferNonce(userAddress,batchId).call();

                let tokenGasPrice = await ercForwarderClient.getTokenGasPrice(config.usdc.address);
                let multiplyingFactor = 1; // fee multiplier that you want 
                let newTokenGasPrice = (parseFloat(tokenGasPrice) * parseFloat(multiplyingFactor.toString())).toString();
                tokenGasPrice = parseInt(newTokenGasPrice).toString();
                console.log("type of:  " + typeof(tokenGasPrice));
                console.log("type of:  " + typeof(newTokenGasPrice));

                console.log(usdcDomainData);

                let req = {};
                req.batchId = batchId;
                req.batchNonce = Number(transferNonce);
                req.from = userAddress;
                req.tokenGasPrice = Number(tokenGasPrice);
                req.token = config.usdc.address;
                req.to = receiver;
                req.value = "10000000000000000";

                const requestToSign = {
                    types: {
                        EIP712Domain: domainType,
                        TokenTransferRequest: tokenTransferRequestType
                    },
                    domain: domainData,
                    primaryType: "TokenTransferRequest",
                    message: req
                };

                const signatureNew = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: requestToSign }, 'V3'); //v3 or v4
                let signatureBreakdown = getSignatureParameters(signatureNew);

            
                const usdcPermitOptions = {
                  domainData: usdcDomainData,
                  spender: config.contract.address,
                  value: "10000000000000000000000",  // kovan USDC has 18 decimals so this would change accordingly for mainnet
                  userAddress: userAddress,
                  deadline: Number(Math.floor(Date.now() / 1000 + 3600)),
                };

                console.log(usdcPermitOptions);

                const usdcNonce = await usdcToken.methods.nonces(userAddress).call();
                console.log(`nonce is : ${usdcNonce}`);

                const permitDataToSign = {
                  types: {
                    EIP712Domain: usdcDomainType,
                    Permit: eip2612PermitType,
                  },
                  domain: usdcDomainData,
                  primaryType: "Permit",
                  message: {
                    owner: userAddress,
                    spender: usdcPermitOptions.spender,
                    nonce: parseInt(usdcNonce),
                    value: usdcPermitOptions.value,
                    deadline: parseInt(usdcPermitOptions.deadline),
                  },
                };

                const signature = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: permitDataToSign }, 'V3'); //v3 or v4
                let { r, s, v } = getSignatureParameters(signature);

                let permitOptions = {};
                permitOptions.holder = userAddress;
                permitOptions.spender = usdcPermitOptions.spender;
                permitOptions.value = usdcPermitOptions.value;
                permitOptions.nonce = parseInt(usdcNonce.toString());
                permitOptions.expiry = parseInt(usdcPermitOptions.deadline);
                permitOptions.allowed = true;
                permitOptions.v = v;
                permitOptions.r = r;
                permitOptions.s = s;

                let functionSignature = contract.methods.permitEIP2612AndTransfer(req, signatureBreakdown.r, signatureBreakdown.s, signatureBreakdown.v, permitOptions).encodeABI();
                let gasLimit = await contract.methods
                    .permitEIP2612AndTransfer(req, signatureBreakdown.r, signatureBreakdown.s, signatureBreakdown.v, permitOptions)
                    .estimateGas({ from: userAddress });
                
                console.log("GAS LIMIT");
                console.log(Number(gasLimit));


                let cost = ethers.BigNumber.from(gasLimit.toString())
                       .mul(ethers.BigNumber.from(req.tokenGasPrice));

                cost = (
                        parseFloat(cost) /
                        parseFloat(ethers.BigNumber.from(10).pow(tokenDecimals))
                        ).toFixed(3);    

                let spendValue = parseFloat(cost).toString();
                console.log(spendValue);
                //make sure user has enough balance!

                sendSignedTransactionWithPermit(userAddress, functionSignature);
            } else {
                console.log("Sending normal transaction");
                let tx = await contract.setQuote(newQuote);
                console.log("Transaction hash : ", tx.hash);
                showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
                let confirmation = await tx.wait();
                console.log(confirmation);
                setTransactionHash(tx.hash);

                showSuccessMessage("Transaction confirmed on chain");
                //getQuoteFromNetwork();
            }
        } else {
            showErrorMessage("Please enter the quote");
        }
    };

    // use this transfer if there is enough allowance to pay fees and make transfer 
    // method to register on the dashboard is executeMetaTransaction (this method is from the Base contract for signature verification)
    const onTransferWithPrivateKey = async event => {
        if (newQuote != "" && contract) {
            setTransactionHash("");
            if (metaTxEnabled) {
                debugger;
                showInfoMessage(`Getting user signature`);
                let privateKey = "f78b11516983e1450ac8e4dc636a737cd24574d77cefb7def83f15eef0c8216c";
                let userAddressCustom = "0x90d25917D46b5b6c92c0f213A4BA83698d36A97C"; // update your user (sender) address per private key and replace userAddressCustom
                let receiver = "0xFAd8e64BF2d15B28a87Fcdf441AD9f8f38757a02";
                let userAddress = userAddressCustom;
                let nonce = await contract.methods.getNonce(userAddress).call();
                console.log(`nonce is : ${nonce}`);
                let tokenGasPrice = await ercForwarderClient.getTokenGasPrice(config.usdc.address);
                let multiplyingFactor = 1;
                let newTokenGasPrice = (parseFloat(tokenGasPrice) * parseFloat(multiplyingFactor.toString())).toString();
                tokenGasPrice = parseInt(newTokenGasPrice).toString();
                console.log("type of:  " + typeof(tokenGasPrice));
                console.log("type of:  " + typeof(newTokenGasPrice));

                let functionSignature = contract.methods.transfer(Number(tokenGasPrice),config.usdc.address,receiver,"10000000000000").encodeABI();     
                let message = {};
                message.nonce = parseInt(nonce);
                message.from = userAddress;
                message.functionSignature = functionSignature;

                debugger;

                const dataToSign = {
                    types: {
                        EIP712Domain: domainType,
                        MetaTransaction: metaTransactionType
                    },
                    domain: domainData,
                    primaryType: "MetaTransaction",
                    message: message
                };

                /* If you're using metamask,  Its important to use eth_signTypedData_v3 and not v4 to get EIP712 signature because we have used salt in domain data
                 instead of chainId */

                const signatureNew = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: dataToSign }, 'V3'); //v3 or v4
                let { r, s, v } = getSignatureParameters(signatureNew);

                sendSignedTransactionTransfer(newTokenGasPrice,userAddress, functionSignature, r, s, v);
            } else {
                console.log("Sending normal transaction");
                let tx = await contract.setQuote(newQuote);
                console.log("Transaction hash : ", tx.hash);
                showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
                let confirmation = await tx.wait();
                console.log(confirmation);
                setTransactionHash(tx.hash);
                showSuccessMessage("Transaction confirmed on chain");
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

    const showErrorMessage = message => {
        NotificationManager.error(message, "Error", 5000);
    };

    const showSuccessMessage = message => {
        NotificationManager.success(message, "Message", 3000);
    };

    const showInfoMessage = message => {
        NotificationManager.info(message, "Info", 3000);
    };

    const sendSignedTransactionWithPermit = async (userAddress, functionSignature) => {
        try {
            showInfoMessage(`Sending transaction via Biconomy`);
            debugger;

            let privateKey = "f78b11516983e1450ac8e4dc636a737cd24574d77cefb7def83f15eef0c8216c";
            // paste your private key here for the user address being passsed
            
             // one more parameter metaInfo to be added to support checks on tokenGasPrice...
            let txParams = {
                "from": userAddress,
                "to": config.contract.address,
                "value": "0x0",
                "gas": "500000", // can be omitted
                "data": functionSignature
            };
            const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
            showInfoMessage(`Transaction sent. Waiting for confirmation ..`)
            let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, txHash) => {
              if (error) {
                return console.error(error);
                }
            });
            console.log("Transaction hash : ", receipt.transactionHash);
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed on chain");
        } catch (error) {
            console.log(error);
            handleClose();
        }
    };

    const sendSignedTransactionTransfer = async (tokenGasPrice, userAddress, functionSignature, r, s, v) => {
        try {
            showInfoMessage(`Sending transaction via Biconomy`);
            debugger;

            let gasLimit = await contract.methods
            .executeMetaTransaction(userAddress, functionSignature, r, s, v)
            .estimateGas({ from: userAddress });

            console.log("GAS LIMIT");
            console.log(Number(gasLimit));

            let cost = ethers.BigNumber.from(gasLimit.toString())
                       .mul(ethers.BigNumber.from(tokenGasPrice));
            
            cost = (
                    parseFloat(cost) /
                    parseFloat(ethers.BigNumber.from(10).pow(tokenDecimals))
                    ).toFixed(3);           

            let spendValue = parseFloat(cost).toString();
            console.log(spendValue);
            //make sure user has enough balance!
 
            let privateKey = "f78b11516983e1450ac8e4dc636a737cd24574d77cefb7def83f15eef0c8216c";
            // paste your private key here for the user address being passsed
            
            let executeMetaTransactionData = contract.methods.executeMetaTransaction(userAddress, functionSignature, r, s, v).encodeABI();

            // one more parameter metaInfo to be added to support checks on tokenGasPrice...
            let txParams = {
                "from": userAddress,
                "to": config.contract.address,
                "value": "0x0",
                "gas": "500000", // can be omitted
                "data": executeMetaTransactionData
            };
            const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
            showInfoMessage(`Transaction sent. Waiting for confirmation ..`)
            let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, txHash) => {
              if (error) {
                return console.error(error);
                }
            });
            console.log("Transaction hash : ", receipt.transactionHash);
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed on chain");           

        } catch (error) {
            console.log(error);
            handleClose();
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
                        <Button variant="contained" color="primary" onClick={onPermitAndTransferWithPrivateKey} style={{ marginLeft: "10px" }}>
                            Permit And Transfer
            </Button>

                        <Button variant="contained" color="secondary" onClick={onTransferWithPrivateKey} style={{ marginLeft: "10px" }}>
                            Transfer
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