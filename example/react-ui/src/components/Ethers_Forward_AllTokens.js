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

import { ethers, providers } from "ethers";
import { Biconomy } from "@biconomy/mexa";

import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");

let config = {
    contract: {
        address: "0x6ec90770285D545B9872795b7D9f833025F4dF9F",
        abi: [{"inputs":[{"internalType":"string","name":"newQuote","type":"string"}],"name":"setQuote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_forwarder","type":"address"}],"name":"setTrustedForwarder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getQuote","outputs":[{"internalType":"string","name":"currentQuote","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"quote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"trustedForwarder","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"versionRecipient","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]
    },
    apiKey: {
        test: "m60yDrUs7.5c3b23fa-0b93-46ac-86f9-79e998d8f361",
        prod: "8nvA_lM_Q.0424c54e-b4b2-4550-98c5-8b437d3118a9"
    }
}

config.erc20ForwarderAddress = "0x9A60349561E0489faB15A6cc5ad9F75061db0F52";
config.daiAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
config.usdtAddress = "0x8e1084f3599ba90991C3b2f9e25D920738C1496D";

config.usdc = {
    address: "0x6043fD7126e4229d6FcaC388c9E1C8d333CCb8fA",
    abi: [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"initialBalance","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"Blacklisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newBlacklister","type":"address"}],"name":"BlacklisterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newMasterMinter","type":"address"}],"name":"MasterMinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"MinterConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"UnBlacklisted","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"APPROVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"INCREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"approveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"enumGasAbstraction.AuthorizationState","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"blacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklister","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},
  {"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"},{"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"configureMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currency","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"decreaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"increaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenName","type":"string"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"string","name":"tokenCurrency","type":"string"},{"internalType":"uint8","name":"tokenDecimals","type":"uint8"},{"internalType":"address","name":"newMasterMinter","type":"address"},{"internalType":"address","name":"newPauser","type":"address"},{"internalType":"address","name":"newBlacklister","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"}],"name":"initializeV2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"masterMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"minterAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contractIERC20","name":"tokenContract","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBlacklister","type":"address"}],"name":"updateBlacklister","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMasterMinter","type":"address"}],"name":"updateMasterMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newPauser","type":"address"}],"name":"updatePauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"updateRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"}] 
  };

config.dai = {
    address: "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",
    abi: [{"inputs":[{"internalType":"uint256","name":"chainId_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"guy","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"internalType":"bytes4","name":"sig","type":"bytes4"},{"indexed":true,"internalType":"address","name":"usr","type":"address"},{"indexed":true,"internalType":"bytes32","name":"arg1","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"arg2","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"deny","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"move","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"allowed","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"pull","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"push","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"rely","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
  };  

let usdcDomainData = {
  name: "USDC Coin",
  version: "1",
  chainId: 42,
  verifyingContract: config.usdc.address,
};

let daiDomainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

let daiPermitType = [
  { name: "holder", type: "address" },
  { name: "spender", type: "address" },
  { name: "nonce", type: "uint256" },
  { name: "expiry", type: "uint256" },
  { name: "allowed", type: "bool" },
];

let daiDomainData = {
  name: "Dai Stablecoin",
  version: "1",
  chainId: 42,
  verifyingContract: config.daiAddress,
};

let domainType = [
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

let walletProvider, walletSigner, ethersProvider;
let contract, contractInterface;
let ercForwarderClient, permitClient;
let usdcToken, daiToken;

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
    const [newToken, setNewToken] = useState("");
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
                debugger;
                const provider = window["ethereum"];
                await provider.enable();
                setLoadingMessage("Initializing Biconomy ...");
                // We're creating biconomy provider linked to your network of choice where your contract is deployed
                let jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://kovan.infura.io/v3/d126f392798444609246423b06116c77");
                biconomy = new Biconomy(provider, {
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

                    // Initialize your dapp here like getting user accounts etc
                    contract = new ethers.Contract(
                        config.contract.address,
                        config.contract.abi,
                        biconomy.getSignerByAddress(userAddress)
                    );

                    usdcToken = new ethers.Contract(
                      config.usdc.address,
                      config.usdc.abi,
                      biconomy.getSignerByAddress(userAddress)
                    );

                    daiToken = new ethers.Contract(
                      config.dai.address,
                      config.dai.abi,
                      biconomy.getSignerByAddress(userAddress)
                    );
          
                    ercForwarderClient = biconomy.erc20ForwarderClient;
                    permitClient = biconomy.permitClient;

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

    const onTokenChange = event => {
      setNewToken(event.target.value);
  };

    //EIP712 only
    const onSubmitWithUSDC = async () => {
      if (newQuote != "" && contract) {
        setTransactionHash("");
        if (metaTxEnabled) {
          let userAddress = selectedAddress;

          console.log(usdcDomainData);

          //If your provider is not a signer with accounts then you must pass userAddress in the permit options

          const usdcPermitOptions = {
            domainData: usdcDomainData,
            value: "100000000000000000000",
            userAddress: userAddress,
            deadline: Number(Math.floor(Date.now() / 1000 + 3600)),
          };

          console.log(usdcPermitOptions);

          console.log("getting permit to spend usdc tokens");
          showInfoMessage(
            `Getting signature and permit transaction to spend usdc token by ERC20 Forwarder contract`
          );

          //If you're not using biconomy's permit client as biconomy's member you can create your own without importing Biconomy.
          //Users need to pass provider object from window, spender address (erc20 forwarder OR the fee proxy address) and DAI's address for your network

          //OR use biconomy's permitclient member as below!  

          // This step only needs to be done once and is valid during the given deadline
          let permitTx = await permitClient.eip2612Permit(usdcPermitOptions);
          await permitTx.wait(1);

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
            token: config.usdc.address,
            txGas: Number(gasLimit),
            data,
          });
          const tx = builtTx.request;
          const fee = builtTx.cost;
          console.log(tx);
          console.log(fee);
          showInfoMessage(`Signing message for meta transaction`);

          //signature of this method is sendTxEIP712({req, signature = null, userAddress})
          //signature param is optional. check network agnostics section for more details about this
          //userAddress is must when your provider does not have a signer with accounts
          let transaction = await ercForwarderClient.sendTxEIP712({ req: tx });
          //returns an object containing code, log, message, txHash
          console.log('here ' + transaction.txHash);

          if (transaction && transaction.code == 200 && transaction.txHash) {
            //event emitter methods
            ethersProvider.once(transaction.txHash, (result) => {
              // Emitted when the transaction has been mined
              console.log(result);
              setTransactionHash(transaction.txHash);
              getQuoteFromNetwork();
            });
          } else {
            showErrorMessage(transaction.message);
          }
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
    
    // EIP712 only!
    const onSubmitWithDAI = async () => {
        if (newQuote != "" && contract) {
          setTransactionHash("");
          if (metaTxEnabled) {
            let userAddress = selectedAddress;
  
            console.log(usdcDomainData);
  
            //If your provider is not a signer with accounts then you must pass userAddress in the permit options
  
            const daiPermitOptions = {
                spender: config.erc20ForwarderAddress,
                expiry: Math.floor(Date.now() / 1000 + 3600),
                allowed: true,
              };
  
            console.log(daiPermitOptions);
  
            console.log("getting permit to spend DAI tokens");
            showInfoMessage(
              `Getting signature and permit transaction to spend DAI token by ERC20 Forwarder contract`
            );
  
            //If you're not using biconomy's permit client as biconomy's member you can create your own without importing Biconomy.
            //Users need to pass provider object from window, spender address (erc20 forwarder OR the fee proxy address) and DAI's address for your network
  
            //OR use biconomy's permitclient member as below!  
  
            // This step only needs to be done once and is valid during the given deadline
            let permitTx = await permitClient.daiPermit(daiPermitOptions);
            await permitTx.wait(1);
  
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
              token: config.dai.address,
              txGas: Number(gasLimit),
              data,
            });
            const tx = builtTx.request;
            const fee = builtTx.cost;
            console.log(tx);
            console.log(fee);
            alert(`You will be charged ${fee} amount of DAI ${biconomy.daiTokenAddress} for this transaction`);
            showInfoMessage(`Signing message for meta transaction`);
  
            //signature of this method is sendTxEIP712({req, signature = null, userAddress})
            //signature param is optional. check network agnostics section for more details about this
            //userAddress is must when your provider does not have a signer with accounts
            let transaction = await ercForwarderClient.sendTxEIP712({ req: tx });
            //returns an object containing code, log, message, txHash
            console.log(transaction);
  
            if (transaction && transaction.code == 200 && transaction.txHash) {
              //event emitter methods
              ethersProvider.once(transaction.txHash, (result) => {
                // Emitted when the transaction has been mined
                console.log(result);
                console.log('this works!');
                console.log(transaction.txHash);
                setTransactionHash(transaction.txHash);
                getQuoteFromNetwork();
              });
            } else {
              showErrorMessage(transaction.message);
            }
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

      // EIP712 only
      const onSubmitWithUSDT = async () => {
        if (newQuote != "" && contract) {
          setTransactionHash("");
          if (metaTxEnabled) {
            let userAddress = selectedAddress;
  
            console.log(usdcDomainData);
  
            //If your provider is not a signer with accounts then you must pass userAddress in the permit options
  
            // user must approve USDT once to give allowance to erc20ForwarderAddress
           
            // assuming we already have allowance
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
              token: config.usdtAddress,
              txGas: Number(gasLimit),
              data,
            });
            const tx = builtTx.request;
            const fee = builtTx.cost;
            console.log(tx);
            console.log(fee);
            alert(`You will be charged ${fee} amount of USDT ${config.usdtAddress} for this transaction`);
            showInfoMessage(`Signing message for meta transaction`);

  
            //signature of this method is sendTxEIP712({req, signature = null, userAddress})
            //signature param is optional. check network agnostics section for more details about this
            //userAddress is must when your provider does not have a signer with accounts
            let transaction = await ercForwarderClient.sendTxEIP712({ req: tx });
            //returns an object containing code, log, message, txHash
            console.log(transaction);
            console.log(transaction.txHash);
  
            if (transaction && transaction.code == 200 && transaction.txHash) {
              //event emitter methods
              ethersProvider.once(transaction.txHash, (result) => {
                // Emitted when the transaction has been mined
                console.log(result);
                setTransactionHash(transaction.txHash);
                getQuoteFromNetwork();
              });
            } else {
              showErrorMessage(transaction.message);
            }
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

    // can make two of these for DAI and for USDC
    const onPermitAndSubmitWithEIP712Sign = async () => {
      if (newQuote != "" && contract) {
        setTransactionHash("");
        if (metaTxEnabled) {
          let userAddress = selectedAddress;

          console.log(usdcDomainData);

          //If your provider is not a signer with accounts then you must pass userAddress in the permit options

          const usdcPermitOptions = {
            spender: config.erc20ForwarderAddress,
            domainData: usdcDomainData,
            value: "100000000000000000000",
            userAddress: userAddress,
            deadline: Number(Math.floor(Date.now() / 1000 + 3600)),
          };

          console.log(usdcPermitOptions);

          const daiPermitOptions = {
            // spender: config.erc20ForwarderAddress,
            expiry: Math.floor(Date.now() / 1000 + 3600),
            allowed: true,
          };

          console.log("getting permit to spend usdc tokens");
          showInfoMessage(
            `Getting signature and permit transaction to spend usdc token by ERC20 Forwarder contract`
          );

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
            token: config.usdc.address,
            txGas: Number(gasLimit),
            data,
            permitType: "EIP2612_Permit",
          });
          const tx = builtTx.request;
          const fee = builtTx.cost;
          console.log(tx);
          console.log(fee);
          showInfoMessage(`Signing message for meta transaction`);

          alert(
            `You will be charged maximum ${fee} amount of USDC ${config.usdc.address} for this transaction`
          );
          showInfoMessage(`Signing message for meta transaction`);

          const nonce = await usdcToken.nonces(userAddress);
          console.log(`nonce is : ${nonce}`);

          const permitDataToSign = {
            types: {
              EIP712Domain: domainType,
              Permit: eip2612PermitType,
            },
            domain: usdcDomainData,
            primaryType: "Permit",
            message: {
              owner: userAddress,
              spender: usdcPermitOptions.spender,
              nonce: parseInt(nonce),
              value: usdcPermitOptions.value,
              deadline: parseInt(usdcPermitOptions.deadline),
            },
          };

          let result = await ethersProvider.send("eth_signTypedData_v3", [
            userAddress,
            JSON.stringify(permitDataToSign),
          ]);

          console.log(result);

          let metaInfo = {};
          let permitOptions = {};

          const signature = result.substring(2);
          const r = "0x" + signature.substring(0, 64);
          const s = "0x" + signature.substring(64, 128);
          const v = parseInt(signature.substring(128, 130), 16);

          permitOptions.holder = userAddress;
          permitOptions.spender = usdcPermitOptions.spender;
          permitOptions.value = usdcPermitOptions.value;
          permitOptions.nonce = parseInt(nonce.toString());
          permitOptions.expiry = parseInt(usdcPermitOptions.deadline);
          permitOptions.allowed = true;
          permitOptions.v = v;
          permitOptions.r = r;
          permitOptions.s = s;

          // validations of permit Type is needed for meta info and within buildTx

          metaInfo.permitType = "EIP2612_Permit";
          metaInfo.permitData = permitOptions;

          //signature of this method is permitAndSendTxEIP712({req, signature = null, userAddress, metaInfo})
          //signature param is optional. check network agnostics section for more details about this
          //userAddress is must when your provider does not have a signer with accounts
          let transaction = await ercForwarderClient.permitAndSendTxEIP712({
            req: tx,
            metaInfo: metaInfo,
          });
          //returns an object containing code, log, message, txHash
          console.log(transaction);

          if (transaction && transaction.code == 200 && transaction.txHash) {
            //event emitter methods
            ethersProvider.once(transaction.txHash, (result) => {
              // Emitted when the transaction has been mined
              console.log(result);
              setTransactionHash(transaction.txHash);
              getQuoteFromNetwork();
            });
          } else {
            showErrorMessage(transaction.message);
          }
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

    const getDaiPermitSignature = async (holder, spender, nonce, expiry) => {
     
      const domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ];
    
      const permit = [
        { name: "holder", type: "address" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "allowed", type: "bool" },
      ];
    
      const domainData = {
        name: "Dai Stablecoin",
        version: "1",
        chainId: 42,
        verifyingContract: config.daiAddress,
      };
    
      const message = {
        holder,
        spender,
        nonce,
        expiry,
        allowed: true,
      };
    
      const data = {
        types: {
          EIP712Domain: domain,
          Permit: permit,
        },
        primaryType: "Permit",
        domain: domainData,
        message: message
      };

      const result = await ethersProvider.send("eth_signTypedData_v4", [
        holder,
        JSON.stringify(data),
      ]);
      console.log("success", result);

      return result;
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
                onClick={onSubmitWithUSDC}
                style={{ marginLeft: "10px" }}
              >
                Pay with USDC
              </Button>

              {/*<Button variant="contained" color="primary" onClick={onPermitAndSubmitWithEIP712Sign} style={{ marginLeft: "10px" }}>
                            Permit And Submit EIP712
                    </Button>*/}

              <Button
                variant="contained"
                color="primary"
                onClick={onSubmitWithDAI}
                style={{ marginLeft: "10px" }}
              >
                Pay with DAI
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={onSubmitWithUSDT}
                style={{ marginLeft: "10px" }}
              >
                Pay with USDT
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