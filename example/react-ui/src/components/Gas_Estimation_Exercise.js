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
import Web3 from "web3";
import { Biconomy } from "@biconomy/mexa";

import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");

// add ERC20 Forwarder
// add Biconomy Forwarder
// add USDC
// add DAI
// add Test Contract that has nada
// add Test Contract that has setQuote

let config = {
    contract: {
        address: "0x853bfD0160d67DF13a9F70409f9038f6473585Bd",
        abi: [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"userAddress","type":"address"},{"indexed":false,"internalType":"addresspayable","name":"relayerAddress","type":"address"},{"indexed":false,"internalType":"bytes","name":"functionSignature","type":"bytes"}],"name":"MetaTransactionExecuted","type":"event"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"bytes","name":"functionSignature","type":"bytes"},{"internalType":"bytes32","name":"sigR","type":"bytes32"},{"internalType":"bytes32","name":"sigS","type":"bytes32"},{"internalType":"uint8","name":"sigV","type":"uint8"}],"name":"executeMetaTransaction","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getQuote","outputs":[{"internalType":"string","name":"currentQuote","type":"string"},{"internalType":"address","name":"currentOwner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"quote","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newQuote","type":"string"}],"name":"setQuote","outputs":[],"stateMutability":"nonpayable","type":"function"}]
    },
    biconomyForwarder: {
        address: "0xF82986F574803dfFd9609BE8b9c7B92f63a1410E",
        abi: [{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"domainValue","type":"bytes"}],"name":"DomainRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"EIP712_DOMAIN_TYPE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REQUEST_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"domains","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"}],"name":"registerDomainSeparator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyEIP712","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyPersonalSign","outputs":[],"stateMutability":"view","type":"function"}] 
    },
    erc20Forwarder: {
        address: "0xCB3F801C91DEcaaE9b08b1eDb915F9677D8fdB4A",
        abi: [ { "inputs": [ { "internalType": "address", "name": "_owner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint128", "name": "newBaseGas", "type": "uint128" }, { "indexed": true, "internalType": "address", "name": "actor", "type": "address" } ], "name": "BaseGasChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "charge", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" } ], "name": "FeeCharged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint128", "name": "newGasRefund", "type": "uint128" }, { "indexed": true, "internalType": "address", "name": "actor", "type": "address" } ], "name": "GasRefundChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint128", "name": "newGasTokenForwarderBaseGas", "type": "uint128" }, { "indexed": true, "internalType": "address", "name": "actor", "type": "address" } ], "name": "GasTokenForwarderBaseGasChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "newOracleAggregatorAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "actor", "type": "address" } ], "name": "OracleAggregatorChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "tokenAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "actor", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "newGas", "type": "uint256" } ], "name": "TransferHandlerGasChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "newForwarderAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "actor", "type": "address" } ], "name": "TrustedForwarderChanged", "type": "event" }, { "inputs": [], "name": "baseGas", "outputs": [ { "internalType": "uint128", "name": "", "type": "uint128" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes32", "name": "domainSeparator", "type": "bytes32" }, { "internalType": "bytes", "name": "sig", "type": "bytes" } ], "name": "executeEIP712", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes32", "name": "domainSeparator", "type": "bytes32" }, { "internalType": "bytes", "name": "sig", "type": "bytes" }, { "internalType": "uint256", "name": "gasTokensBurned", "type": "uint256" } ], "name": "executeEIP712WithGasTokens", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes", "name": "sig", "type": "bytes" } ], "name": "executePersonalSign", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes", "name": "sig", "type": "bytes" }, { "internalType": "uint256", "name": "gasTokensBurned", "type": "uint256" } ], "name": "executePersonalSignWithGasTokens", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "feeManager", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeReceiver", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "forwarder", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "gasRefund", "outputs": [ { "internalType": "uint128", "name": "", "type": "uint128" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "gasTokenForwarderBaseGas", "outputs": [ { "internalType": "uint128", "name": "", "type": "uint128" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" } ], "name": "getNonce", "outputs": [ { "internalType": "uint256", "name": "nonce", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_feeReceiver", "type": "address" }, { "internalType": "address", "name": "_feeManager", "type": "address" }, { "internalType": "address payable", "name": "_forwarder", "type": "address" } ], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "isOwner", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "oracleAggregator", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes32", "name": "domainSeparator", "type": "bytes32" }, { "internalType": "bytes", "name": "sig", "type": "bytes" }, { "components": [ { "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "bool", "name": "allowed", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "internalType": "struct ERC20ForwardRequestTypes.PermitRequest", "name": "permitOptions", "type": "tuple" } ], "name": "permitAndExecuteEIP712", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes32", "name": "domainSeparator", "type": "bytes32" }, { "internalType": "bytes", "name": "sig", "type": "bytes" }, { "components": [ { "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "bool", "name": "allowed", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "internalType": "struct ERC20ForwardRequestTypes.PermitRequest", "name": "permitOptions", "type": "tuple" }, { "internalType": "uint256", "name": "gasTokensBurned", "type": "uint256" } ], "name": "permitAndExecuteEIP712WithGasTokens", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes32", "name": "domainSeparator", "type": "bytes32" }, { "internalType": "bytes", "name": "sig", "type": "bytes" }, { "components": [ { "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "bool", "name": "allowed", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "internalType": "struct ERC20ForwardRequestTypes.PermitRequest", "name": "permitOptions", "type": "tuple" } ], "name": "permitEIP2612AndExecuteEIP712", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "txGas", "type": "uint256" }, { "internalType": "uint256", "name": "tokenGasPrice", "type": "uint256" }, { "internalType": "uint256", "name": "batchId", "type": "uint256" }, { "internalType": "uint256", "name": "batchNonce", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "internalType": "struct ERC20ForwardRequestTypes.ERC20ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes32", "name": "domainSeparator", "type": "bytes32" }, { "internalType": "bytes", "name": "sig", "type": "bytes" }, { "components": [ { "internalType": "address", "name": "holder", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "bool", "name": "allowed", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "internalType": "struct ERC20ForwardRequestTypes.PermitRequest", "name": "permitOptions", "type": "tuple" }, { "internalType": "uint256", "name": "gasTokensBurned", "type": "uint256" } ], "name": "permitEIP2612AndExecuteEIP712WithGasTokens", "outputs": [ { "internalType": "bool", "name": "success", "type": "bool" }, { "internalType": "bytes", "name": "ret", "type": "bytes" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "safeTransferRequired", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint128", "name": "gas", "type": "uint128" } ], "name": "setBaseGas", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_feeManager", "type": "address" } ], "name": "setFeeManager", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_feeReceiver", "type": "address" } ], "name": "setFeeReceiver", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint128", "name": "refund", "type": "uint128" } ], "name": "setGasRefund", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint128", "name": "gas", "type": "uint128" } ], "name": "setGasTokenForwarderBaseGas", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "oa", "type": "address" } ], "name": "setOracleAggregator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "bool", "name": "_safeTransferRequired", "type": "bool" } ], "name": "setSafeTransferRequired", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "_transferHandlerGas", "type": "uint256" } ], "name": "setTransferHandlerGas", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_forwarder", "type": "address" } ], "name": "setTrustedForwarder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "transferHandlerGas", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]
    },
    apiKey: {
        test: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209",
        prod: "8nvA_lM_Q.0424c54e-b4b2-4550-98c5-8b437d3118a9"
    }
}

config.erc20ForwarderAddress = "0xCB3F801C91DEcaaE9b08b1eDb915F9677D8fdB4A";

config.usdc = {
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    abi: [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"initialBalance","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"Blacklisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newBlacklister","type":"address"}],"name":"BlacklisterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newMasterMinter","type":"address"}],"name":"MasterMinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"MinterConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"UnBlacklisted","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"APPROVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"INCREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"approveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"enumGasAbstraction.AuthorizationState","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"blacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklister","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},
  {"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"},{"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"configureMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currency","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"decreaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"increaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenName","type":"string"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"string","name":"tokenCurrency","type":"string"},{"internalType":"uint8","name":"tokenDecimals","type":"uint8"},{"internalType":"address","name":"newMasterMinter","type":"address"},{"internalType":"address","name":"newPauser","type":"address"},{"internalType":"address","name":"newBlacklister","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"}],"name":"initializeV2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"masterMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"minterAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contractIERC20","name":"tokenContract","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBlacklister","type":"address"}],"name":"updateBlacklister","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMasterMinter","type":"address"}],"name":"updateMasterMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newPauser","type":"address"}],"name":"updatePauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"updateRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"}] 
  };

config.dai = {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    abi: [{"inputs":[{"internalType":"uint256","name":"chainId_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"guy","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"internalType":"bytes4","name":"sig","type":"bytes4"},{"indexed":true,"internalType":"address","name":"usr","type":"address"},{"indexed":true,"internalType":"bytes32","name":"arg1","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"arg2","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"deny","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"move","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"allowed","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"pull","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"push","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"rely","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
  };  

config.usdt = {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    abi: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_upgradedAddress","type":"address"}],"name":"deprecate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deprecated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"upgradedAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maximumFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newBasisPoints","type":"uint256"},{"name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"basisPointsRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isBlackListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_UINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_blackListedUser","type":"address"}],"name":"destroyBlackFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAddress","type":"address"}],"name":"Deprecate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feeBasisPoints","type":"uint256"},{"indexed":false,"name":"maxFee","type":"uint256"}],"name":"Params","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_blackListedUser","type":"address"},{"indexed":false,"name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"AddedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}]
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

let domainData = {
    name: "TestContract",
    version: "1",
    verifyingContract: config.contract.address,
    salt: ethers.utils.hexZeroPad((ethers.BigNumber.from(42)).toHexString(), 32)
};

let ethersProvider,walletProvider, walletSigner;
let contract, contractInterface, web3, signer, web3Contract, daiContract;

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

    const getSignerByAddress = (signer, userAddress) => {
        signer = signer.connectUnchecked();
        signer.getAddress = async () => {
          return userAddress
        }
        return signer;
      }


    useEffect(() => {
        async function init() {
            if (
                typeof window.ethereum !== "undefined" &&
                window.ethereum.isMetaMask
            ) {
                debugger;
                // Make this my playgorund for gas estimations!!

                // Ethereum user detected. You can now use the provider.
                const provider = window["ethereum"];
                await provider.enable();
                setLoadingMessage("Initializing Biconomy ...");
                let kovanProvider = new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/06dac6fa21144bc182ed39f8a155a4d4");

                ethersProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/06dac6fa21144bc182ed39f8a155a4d4");
                signer = ethersProvider.getSigner();

                // We're creating biconomy provider linked to your network of choice where your contract is deployed
                biconomy = new Biconomy(new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/06dac6fa21144bc182ed39f8a155a4d4"),
                    { apiKey: config.apiKey.prod, debug: true });

                /*
                  This provider is linked to your wallet.
                  If needed, substitute your wallet solution in place of window.ethereum 
                */
                //ethersProvider = new ethers.providers.Web3Provider(biconomy);
                walletProvider = new ethers.providers.Web3Provider(window.ethereum);
                walletSigner = walletProvider.getSigner();

                web3 = new Web3(window.ethereum);

                let userAddress = await walletSigner.getAddress()
                setSelectedAddress(userAddress);

                contract = new ethers.Contract(
                    config.contract.address,
                    config.contract.abi,
                    //getSignerByAddress(signer,userAddress)
                    ethersProvider
                );

                daiContract = new ethers.Contract(
                    config.dai.address,
                    config.dai.abi,
                    //getSignerByAddress(signer,userAddress)
                    ethersProvider
                );

                contractInterface = new ethers.utils.Interface(config.contract.abi);

                 //with contractInterface
                 let functionSignature2 = contractInterface.encodeFunctionData("quote",[]);
                
                // get balance
                let bal = await ethersProvider.getBalance(userAddress);
                console.log(bal.toString());

                // reading from contract
                /*let result = await contract.getQuote();
                console.log(result);*/

                // encodeABI stuff 1
                /*let  otherData  = await contract.populateTransaction.setQuote("hello frends");
                console.log(otherData);*/

                let { data } = await daiContract.populateTransaction.transferFrom("0x627669289d3Ed0868B1DDe8ad579aE67bd2f43AD","0x4Dd4078Fb19B08048B6843Ba5A27e726B72230E7",ethers.utils.parseEther("1"));
                console.log(data);

                let gasGas = await ethersProvider.estimateGas({from:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",to: config.dai.address,data: data});
                console.log(gasGas.toString());

                //estimate gas
                let gasLim = await ethersProvider.estimateGas({from:selectedAddress,to: config.contract.address,data: data});
                console.log(gasLim.toNumber());
                console.log(typeof(gasLim));

                //estimate gas web3
                let web3GasLim = await web3Contract.methods.setQuote("hey guys").estimateGas({from:userAddress});
                console.log(web3GasLim);
                console.log(typeof(web3GasLim));

                let hexStringCheck = ethers.BigNumber.from("21000").toHexString();
                console.log(hexStringCheck);
                console.log(typeof(hexStringCheck));

                let hexCheck = web3.utils.toHex(21000);
                console.log(hexCheck);
                console.log(typeof(hexCheck));


                biconomy.onEvent(biconomy.READY, async () => {
                    debugger;
                    // Initialize your dapp here like getting user accounts etc
                    contract = new ethers.Contract(
                        config.contract.address,
                        config.contract.abi,
                        signer.connectUnchecked()
                    );

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
                sendSignedTransaction(userAddress, functionSignature, r, s, v);
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
            let rawTx, tx;
            rawTx = {
              to: config.contract.address,
              data: contractInterface.encodeFunctionData(
                "executeMetaTransaction",
                [userAddress, functionSignature, r, s, v]
              ),
              from: userAddress,
            };
            tx = await wallet.signTransaction(rawTx);

            let transactionHash;
            try {
              let receipt = await ethersProvider.sendTransaction(tx);
              console.log(receipt);
            } catch (error) {
              // Ethers check the hash from user's signed tx and hash returned from Biconomy
              // Both hash are expected to be different as biconomy send the transaction from its relayers
              if (error.returnedHash && error.expectedHash) {
                console.log("Transaction hash : ", error.returnedHash);
                transactionHash = error.returnedHash;
              } else {
                console.log(error);
                showErrorMessage("Error while sending transaction");
              }
            }

            if (transactionHash) {
              showInfoMessage(
                `Transaction sent by relayer with hash ${transactionHash}`
              );
              let receipt = await ethersProvider.waitForTransaction(
                transactionHash
              );
              console.log(receipt);
              showSuccessMessage("Transaction confirmed on chain");
              getQuoteFromNetwork();
            } else {
              showErrorMessage("Could not get transaction hash");
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

    const sendSignedTransaction = async (userAddress, functionData, r, s, v) => {
        try {
            showInfoMessage(`Sending transaction via Biconomy`);
            let tx = await contract.executeMetaTransaction(userAddress, functionData, r, s, v);
            showInfoMessage(`Transaction sent. Waiting for confirmation ..`)
            await tx.wait(1);
            console.log("Transaction hash : ", tx.hash);
            //let confirmation = await tx.wait();
            console.log(tx);
            setTransactionHash(tx.hash);

            showSuccessMessage("Transaction confirmed on chain");
            getQuoteFromNetwork();

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
                        <Button variant="contained" color="primary" onClick={onSubmitWithEIP712Sign} style={{ marginLeft: "10px" }}>
                            Submit
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